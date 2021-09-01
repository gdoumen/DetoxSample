const AttachedAndroidDriver = require('detox/src/devices/drivers/android/attached/AttachedAndroidDriver');
const AndroidDriver = require('detox/src/devices/drivers/android/AndroidDriver');
const FreeDeviceFinder = require('detox/src/devices/drivers/android/tools/FreeDeviceFinder');
const DeviceRegistry = require('detox/src/devices/DeviceRegistry');

const AndroidInstrumentsPlugin = require('detox/src/artifacts/instruments/android/AndroidInstrumentsPlugin');
const ADBLogcatPlugin = require('detox/src/artifacts/log/android/ADBLogcatPlugin');
const ADBScreencapPlugin = require('detox/src/artifacts/screenshot/ADBScreencapPlugin');
const ADBScreenrecorderPlugin = require('detox/src/artifacts/video/ADBScreenrecorderPlugin');
const AndroidDevicePathBuilder = require('detox/src/artifacts/utils/AndroidDevicePathBuilder');
const TimelineArtifactPlugin = require('detox/src/artifacts/timeline/TimelineArtifactPlugin');

const ADB = require('detox/src/devices/drivers/android/exec/ADB');
const DetoxRuntimeError = require('detox/src/errors/DetoxRuntimeError');
const TempFileXfer = require('detox/src/devices/drivers/android/tools/TempFileXfer');
const AppInstallHelper = require('detox/src/devices/drivers/android/tools/AppInstallHelper');
const AppUninstallHelper = require('detox/src/devices/drivers/android/tools/AppUninstallHelper');
const MonitoredInstrumentation = require('detox/src/devices/drivers/android/tools/MonitoredInstrumentation');
const logger = require('detox/src/utils/logger');

const {escape} = require('detox/src/utils/pipeCommands');
const {execWithRetriesAndLogs, spawnAndLog} = require('detox/src/utils/exec');
const path = require('path');

const remoteServer = '92.79.92.180';
const remoteUser = 'mva';
const remoteAdb = '/Applications/Experitest/Cloud/Agent/bin/adb/adb';
const remoteDir = '/Users/mva/VFCLoud';

class ADBRemote extends ADB {
  async adbCmd(deviceId, params, options = {}) {
    //console.log('~~~adb remote', deviceId, params, options);

    const serial = `${deviceId ? `-s ${deviceId}` : ''}`;
    const cmd = `ssh ${remoteUser}@${remoteServer} ${remoteAdb} ${serial} ${params}`;
    const _options = {
      retries: 1,
      ...options,
    };
    return execWithRetriesAndLogs(cmd, _options);
  }

  async reverse(deviceId, port) {
    return;
  }

  async reverseRemove(deviceId, port) {
    return;
  }

  async pull(deviceId, src, dst = '') {
    //console.log('~~~pull', {deviceId, src, dst});

    const fileName = path.basename(src);
    const remoteFile = `${remoteDir}/${fileName}`;
    await this.adbCmd(deviceId, `pull "${src}" "${remoteFile}"`);
    await this.receiveFile(remoteFile, dst);

    const cmd = `ssh ${remoteUser}@${remoteServer} rm ${remoteFile}`;
    execWithRetriesAndLogs(cmd, {retries: 1});

    return;
  }

  async receiveFile(remoteFile, fullFilePath) {
    const dest = `"${fullFilePath}"`;
    const cmd = `scp ${remoteUser}@${remoteServer}:${remoteFile} ${dest} `;
    const _options = {
      retries: 1,
    };
    const res = await execWithRetriesAndLogs(cmd, _options);
    if (res && res.childProcess && res.childProcess.exitCode === 0) {
      return fullFilePath;
    }
  }

  async copyFile(fullFilePath) {
    const fileName = path.basename(fullFilePath);

    const cmd = `scp ${fullFilePath} ${remoteUser}@${remoteServer}:${remoteDir}/${fileName}`;
    const _options = {
      retries: 1,
    };
    const res = await execWithRetriesAndLogs(cmd, _options);
    if (res && res.childProcess && res.childProcess.exitCode === 0) {
      return `${remoteDir}/${fileName}`;
    }
  }

  logcat(deviceId, {file, pid, time}) {
    // time parameter was always causing failures in DeviceCloud Devices
    return super.logcat(deviceId, {file, pid});
  }

  async install(deviceId, apkPath) {
    apkPath = `${escape.inQuotedString(apkPath)}`;
    const apiLvl = await this.apiLevel(deviceId);

    const remoteName = await this.copyFile(apkPath);
    if (!remoteName) {
      throw new DetoxRuntimeError({
        message: `Failed to install app on ${deviceId}: ${apkPath}`,
        debugInfo: 'could not scp file ',
      });
    }

    let childProcess;
    if (apiLvl >= 24) {
      childProcess = await this.adbCmd(
        deviceId,
        `install -r -g -t ${remoteName}`,
      );
    } else {
      childProcess = await this.adbCmd(deviceId, `install -rg ${remoteName}`);
    }

    const [failure] =
      (childProcess.stdout || '').match(/^Failure \[.*\]$/m) || [];
    if (failure) {
      throw new DetoxRuntimeError({
        message: `Failed to install app on ${deviceId}: ${apkPath}`,
        debugInfo: failure,
      });
    }
  }

  spawn(deviceId, params, spawnOptions) {
    const serial = deviceId ? ['-s', deviceId] : [];
    return spawnAndLog(
      'ssh',
      [`${remoteUser}@${remoteServer}`, remoteAdb, ...serial, ...params],
      spawnOptions,
    );
  }
}

class VFCloudDriver extends AndroidDriver {
  constructor(config) {
    super(config);

    this.adb = new ADBRemote();
    this.fileXfer = new TempFileXfer(this.adb);
    this.appInstallHelper = new AppInstallHelper(this.adb, this.fileXfer);
    this.appUninstallHelper = new AppUninstallHelper(this.adb);
    this.instrumentation = new MonitoredInstrumentation(this.adb, logger);

    this._name = 'Unnamed Android Device';

    this._deviceRegistry = DeviceRegistry.forAndroid();
    this._freeDeviceFinder = new FreeDeviceFinder(
      this.adb,
      this._deviceRegistry,
    );
  }

  declareArtifactPlugins() {
    //console.log('~~~ VFCloud:declareArtifactPlugins');
    const {adb, client, devicePathBuilder} = this;

    return {
      instruments: (api) =>
        new AndroidInstrumentsPlugin({api, adb, client, devicePathBuilder}),
      log: (api) => new ADBLogcatPlugin({api, adb, devicePathBuilder}),
      screenshot: (api) =>
        new ADBScreencapPlugin({api, adb, devicePathBuilder}),
      video: (api) =>
        new ADBScreenrecorderPlugin({api, adb, devicePathBuilder}),
      timeline: (api) => new TimelineArtifactPlugin({api}),
    };
  }

  async acquireFreeDevice(deviceQuery) {
    //console.log('acquireFreeDevice', deviceQuery);

    const adbName = deviceQuery ? deviceQuery.adbName : undefined;

    await this.adb.apiLevel(adbName);
    await this.adb.unlockScreen(adbName);
    await this.emitter.emit('bootDevice', {
      coldBoot: false,
      deviceId: adbName,
      type: 'device',
    });

    this._name = adbName;
    return adbName;
  }
  /*
  async installApp(deviceId, _binaryPath, _testBinaryPath) {
    //const status = this.client._asyncWebSocket.status();
    console.log(
      '~~~ VFCloud:installApp',
      //status,
      deviceId,
      _binaryPath,
      _testBinaryPath,
    );
    const before = Date.now();
    const res = await super.installApp(deviceId, _binaryPath, _testBinaryPath);
    const after = Date.now();

    console.log('~~~ VFCloud:installApp duration', after - before);
    return res;
  }
*/
  async cleanup(adbName, bundleId) {
    //console.log('cleanup', adbName, bundleId);
    await this._deviceRegistry.disposeDevice(adbName);
    await super.cleanup(adbName, bundleId);
  }

  get name() {
    return this._name;
  }

  async _reverseServerPort(adbName) {
    console.log('~~~ VFCloud:_reverseServerPort', adbName);
    const serverPort = new URL(this.client.serverUrl).port;
    return serverPort;
  }
}

module.exports = {
  DriverClass: VFCloudDriver,
};
