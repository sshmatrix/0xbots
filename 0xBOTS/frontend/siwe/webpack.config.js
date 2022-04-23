const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  resolve: {
    fallback: {
      fs: false,
      path: false,
      util: false
    }
  },
  output: {
    filename: 'main.js',
    path: path.join(__dirname,'/../../public_html/frontend')
  },
  externals: {
    'Config': JSON.stringify(process.env.NODE_ENV === 'production' ? {
      serverUrl: "https://work.inpl.one:3001"
    } : {
      serverUrl: "http://localhost:3000"
    })
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      path: path.join(__dirname,'/../../public_html/frontend')
    })
  ]
};
