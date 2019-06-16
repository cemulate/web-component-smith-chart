const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'web-component-smith-chart.js',
    library: 'webComponentSmithChart',
    libraryTarget: 'umd',
  }
};