/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import StoryBookUI from './storybook';

import {name as appName} from './app.json';

if (process.env.SBTEST) {
  AppRegistry.registerComponent(appName, () => StoryBookUI);
} else {
  AppRegistry.registerComponent(appName, () => App);
}
