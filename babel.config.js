module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          // This needs to be mirrored in tsconfig.json
          '@': './src',
        },
      },
    ],
    ['module:react-native-dotenv'],
  ],
};
