/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts

const sourceExts= process.env.RN_SRC_EXT
                ? process.env.RN_SRC_EXT.split(',').concat(defaultSourceExts)
                : defaultSourceExts;
console.log( sourceExts)

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: { 
    sourceExts
  }
};

