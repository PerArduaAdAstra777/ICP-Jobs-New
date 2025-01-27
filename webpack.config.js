const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development', // Set the mode to development
  entry: './src/icp-jobs-frontend/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/', // Ensure the public path is set correctly
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    open: true, // Automatically open the browser
    hot: true, // Enable Hot Module Replacement
    historyApiFallback: true, // Ensure the server serves index.html for all routes
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/icp-jobs-frontend/index.html',
    }),
    new webpack.HotModuleReplacementPlugin(), // Add HMR plugin
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'), // Define the NODE_ENV variable
    }),
  ],
};
