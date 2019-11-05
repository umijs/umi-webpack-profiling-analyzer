const ProfilingAnalyzer = require('./lib/ProfilingAnalyzer');

module.exports = (opts = {}) => {

  const {
    env = 'dev'
  } = opts;

  const isDev = env === 'dev';

  return {
    mode: isDev ? 'development' : 'production',
    context: __dirname,
    entry: './client/viewer',
    output: {
      path: `${__dirname}/public`,
      filename: 'viewer.js',
      publicPath: './'
    },
    plugins: [
      new ProfilingAnalyzer()
    ]
  };
};