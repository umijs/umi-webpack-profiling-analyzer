const {ProfilingAnalyzer} = require('./lib/ProfilingAnalyzer');

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
    resolve: {
      extensions: ['.js', '.jsx']
    },
    // watch: true,

    module: {
      rules: [
        {
          test: /\.less$/u,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  mode: 'local',
                  localIdentName: '[local]--[hash:base64:5]',
                  hashPrefix: 'wpa-'
                },
                sourceMap: true
              }
            },
            {
              loader: 'less-loader',
              options: {
                sourceMap: true
              }
            }
          ]
        },
        {
          test: /\.jsx?$/u,
          exclude: /(node_modules|client\/vendor)/u,
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              ['@babel/preset-env', {
                // Target browsers are specified in .browserslistrc

                modules: false,
                useBuiltIns: 'usage',
                corejs: 2,
                exclude: [
                  // Excluding unused polyfills to completely get rid of `core.js` in the resulting bundle
                  'web.dom.iterable',
                  'es7.symbol.async-iterator'
                ],
                debug: true
              }],
              '@babel/preset-react'
            ],
            plugins: [
              'lodash',
              ['@babel/plugin-proposal-decorators', {legacy: true}],
              ['@babel/plugin-proposal-class-properties', {loose: true}],
              ['@babel/plugin-transform-runtime', {
                useESModules: true
              }]
            ]
          }
        }
      ]
    },
    plugins: [
      new ProfilingAnalyzer({ analyzerMode: 'none' })
    ]
  };
};