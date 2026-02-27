const plugins = [];

try {
  require.resolve('react-native-unistyles/plugin');
  plugins.push(['react-native-unistyles/plugin']);
} catch {
  // Unistyles not installed yet in this environment.
}

plugins.push('react-native-reanimated/plugin');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins,
};
