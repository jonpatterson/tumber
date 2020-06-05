const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const metadata = require('./package.json');

const CHROME = {
  name: 'Tumber - Tab Numbers for Google Chrome\u2122',
  description: 'Show tab numbers in Google Chrome\u2122 for tab jumping ninja!',
};
const EDGE = {
  name: 'Tumber - Tab Numbers for Microsoft Edge\u2122',
  description:
    'Show tab numbers in Microsoft Edge\u2122 for tab jumping ninja!',
};

const optimize = (buffer, name, description) => {
  const manifest = JSON.parse(buffer.toString());
  manifest.version = metadata.version;
  manifest.name = name;
  manifest.description = description;
  return JSON.stringify(manifest, null, 2);
};

const copyPluginConfig = (platform) => {
  switch (platform) {
    case 'chrome':
      return {
        patterns: [
          { from: 'src/icons', to: 'icons' },
          {
            from: path.resolve(__dirname, 'src/manifest.json'),
            transform(content) {
              return optimize(content, CHROME.name, CHROME.description);
            },
          },
        ],
      };
    case 'edge':
      return {
        patterns: [
          { from: 'src/icons', to: 'icons' },
          {
            from: path.resolve(__dirname, 'src/manifest.json'),
            transform(content) {
              return optimize(content, EDGE.name, EDGE.description);
            },
          },
        ],
      };
  }
};

module.exports = (env) => ({
  mode: env.production ? 'production' : 'development',
  devtool: env.production ? 'none' : 'inline-source-map',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, `dist/${env.platform}`),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['*', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin(copyPluginConfig(env.platform)),
    new CopyPlugin({
      patterns: [
        { from: 'src/icons', to: 'icons' },
        {
          from: path.resolve(__dirname, 'src/manifest.json'),
          transform(content) {
            return optimize(content);
          },
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
});
