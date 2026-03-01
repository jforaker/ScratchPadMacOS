const { createSystemFont, defaultConfig } = require('@tamagui/config/v4');
const { createTamagui } = require('@tamagui/core');

const notoSansFont = createSystemFont({
  font: {
    family: 'Noto Sans',
    weight: {
      1: '400',
      2: '400',
      3: '500',
      4: '500',
      5: '600',
      6: '700',
      7: '700',
      8: '700',
      9: '700',
      10: '700',
      11: '700',
      12: '700',
      13: '700',
      14: '700',
      15: '700',
      16: '700',
    },
  },
});

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  fonts: {
    ...defaultConfig.fonts,
    body: notoSansFont,
    heading: notoSansFont,
  },
  settings: {
    ...defaultConfig.settings,
    defaultFont: 'body',
  },
});

module.exports = tamaguiConfig;
