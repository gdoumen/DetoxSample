# React Native Sample App

This repo contains a simple React Native Sample app, which main purpose is to act as 'application under test' for various testing tools

The functionality of the app is rather limited: It only presents  Chuck Norris Jokes. Swiping down will refresh the app with a new joke

:warning: Although the app is developed in ReactNative: so far, it only has been tested for Android. In the documentation below, we will focus on steps to test the Android Build. IOS might work, but this has not been tested so far.

## Preparing the application

In order to prepare the application, you have to
- Clone this repository
- Enter > ``cd /SampleApp``
- Enter > ``npm install``
- Ensure that you have installed Android SDK. This will be used when launching/testing the app

## Running Unit Tests with React Test Renderer

Assuming oyu are still in the SampleApp directory, you can launch the Unit Tests with `npm test`

This will execute the tests that are located in the [./\_\_tests\_\_](./__tests__) folder

You might observe some warning logs. This can be ignored as long as the test status is reported as success.
The warnings are appearing because the react test renderer does not seem to properly call the componentWillUnmount() of the component and load() might happen while unmonut already has happened.

## Running E2E Tests with Detox

- Get the ID of the device connected to your machine > ``adb devices``
  ```
  >adb devices
  List of devices attached
  RF8M9288G4J     device
  ````

- Modiy ./detoxrc.json: 

    Replace adbName in the following part of the file with the ID you have received in the previous step
    ```
      "device": {
        "adbName": "RF8M9288G4J"
      },
    ````

- Build the Detox Bundle: 

  Detox requires a special build of the application, which includes the Detox libraries. In order to trigger the build, the following steps have to be done:

  On Unix: Enter > `detox build -c android`

  On Windows:
  - Enter > `cd android`
  - Enter > `gradlew clean assembleDebug assembleAndroidTest -DtestBuildType=debug`
  - Enter > `cd ..`

- Run the test 

  Enter > `detox -c android .`

  This will execute the tests that are located in the [./e2e](./e2e)  folder

## Running Detox Tests against a backend mock

Typically, you would want to test your app in isolation, i.e. you would mock all external components ( Backends, Databases,...)

This can be achieved by setting the environment variable RN_SRC_EXT to 'e2e.js' 

- Unix: `export RN_SRC_EXT='e2e.js'`
- Windows: `SET RN_SRC_EXT='e2e.js'`

Then you need to rebuild the Detox bundle and launch the test as described in the previous section

## Running Component Tests with Storybook

This can be achieved by setting the environment variable SBTEST to 'true' 

- Unix: `export SBTEST=true`
- Windows: `SET SBTEST=true`

Then enter > ``npm run android``


## Running the application 

In order to run the application, you need to call 

- Ensure your device is connect via USB or you have a running Emulator
- Enter > ``npm run android``

This will launch the metro server (which provides the JavaScript bundle for the app and offers debug/refresh functionality) and start the build and installation of the application bundle. 

