module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          // Narrowed from the whole project root to just ./src — with the
          // wider root, this plugin was also processing other packages'
          // own source files as Metro transformed them (some Expo
          // packages, including expo-image-picker, ship raw TypeScript and
          // rely on Metro/Babel to compile it), and rewriting their
          // internal imports into broken paths climbing back out of
          // node_modules. @ only ever needs to resolve into ./src anyway.
          root: ['./src'],
          alias: { '@': './src' },
          extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.jsx', '.js', '.json'],
        },
      ],
    ],
  };
};
