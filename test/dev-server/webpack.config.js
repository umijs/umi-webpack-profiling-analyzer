const ProfileAnalyzerPlugin = require('../../lib/ProfilingAnalyzer');

module.exports = {
  mode: 'development',
  entry: `${__dirname}/src.js`,
  output: {
    path: `${__dirname}/output`,
    filename: 'bundle.js'
  },
  plugins: [
    new ProfileAnalyzerPlugin({
      analyzerMode: 'server'
    })
  ]
};