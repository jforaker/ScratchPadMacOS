import { AppRegistry, NativeModules } from 'react-native';
import '@tamagui/native/setup-zeego';
import App from './App';
import { name as appName } from './app.json';

if (typeof global.matchMedia !== 'function') {
  global.matchMedia = () => ({
    matches: false,
    media: '',
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}

if (__DEV__) {
  NativeModules.DevSettings.setIsSecondaryClickToShowDevMenuEnabled(false);
}

AppRegistry.registerComponent(appName, () => App);
