const path = require('node:path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    main: './src/index.ts',
  },
  externals: [nodeExternals()],
  mode: 'production',
  output: {
    filename: '[name]-bundle.js', // <--- Will be compiled to this single file
    path: path.resolve(__dirname, './build'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  target: 'node',
};
