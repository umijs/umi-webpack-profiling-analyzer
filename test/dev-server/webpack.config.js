const { ProfilingAnalyzer } = require('../../lib/ProfilingAnalyzer');

console.log('>>> ProfilingAnalyzer', ProfilingAnalyzer);

module.exports = {
  mode: 'development',
  entry: `${__dirname}/src.js`,
  output: {
    path: `${__dirname}/output`,
    filename: 'bundle.js'
  },
  plugins: [
    new ProfilingAnalyzer({
      analyzerMode: 'none'
    })
  ]
};