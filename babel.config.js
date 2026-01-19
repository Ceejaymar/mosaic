module.exports = (api) => {
  api.cache(true);

  const isProd = process.env.NODE_ENV === 'production';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'react-native-unistyles/plugin',
        {
          root: 'src',
          autoProcessPaths: ['app'],
          debug: !isProd,
        },
      ],
      ['inline-import', { extensions: ['.sql'] }],
      'react-native-reanimated/plugin',
    ],
  };
};
