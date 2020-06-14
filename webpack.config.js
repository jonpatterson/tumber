const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const metadata = require('./package.json');

const BROWSERS = {
  chrome: {
    name: 'Tumber - Tab Numbers for Google Chrome\u2122',
    description:
      'Show tab numbers in Google Chrome\u2122 for tab jumping ninja!',
  },
  edge: {
    name: 'Tumber - Tab Numbers for Microsoft Edge\u2122',
    description:
      'Show tab numbers in Microsoft Edge\u2122 for tab jumping ninja!',
  },
};

const optimize = (buffer, platform) => {
  const template = JSON.parse(buffer.toString());

  const manifest = {
    ...template,
    version: metadata.version,
    name: platform ? BROWSERS[platform].name : metadata.name,
    description: platform
      ? BROWSERS[platform].description
      : metadata.description,
  };

  return JSON.stringify(manifest, null, 2);
};

const copyPluginConfig = (env) => {
  return {
    patterns: [
      { from: 'src/icons', to: 'icons' },
      {
        from: path.resolve(__dirname, 'src/manifest.json'),
        transform(content) {
          return env.development
            ? optimize(content)
            : optimize(content, env.platform);
        },
      },
    ],
  };
};

module.exports = (env) => ({
  mode: env.production ? 'production' : 'development',
  devtool: env.production ? 'none' : 'inline-source-map',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['*', '.js'],
  },
  plugins: [new CleanWebpackPlugin(), new CopyPlugin(copyPluginConfig(env))],
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
