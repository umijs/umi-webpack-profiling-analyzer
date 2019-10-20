const chai = require('chai');
const _ = require('lodash');
const webpack = require('webpack');
const ProfilingAnalyzerPlugin = require('../lib/ProfilingAnalyzer');

chai.use(require('chai-subset'));

global.expect = chai.expect;
global.webpackCompile = webpackCompile;
global.makeWebpackConfig = makeWebpackConfig;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function webpackCompile(config) {
  await new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.hasErrors()) {
        return reject(stats.toJson({source: false}).errors);
      }

      resolve();
    });
  });
  // Waiting for the next tick (for analyzer report to be generated)
  await timeout(1);
}

function makeWebpackConfig(opts) {
  opts = _.merge({
    profilingAnalyzerOptions: {

    },
    minify: false,
    multipleChunks: false
  }, opts);

  return {
    context: __dirname,
    mode: 'development',
    entry: {
      bundle: './src'
    },
    output: {
      path: `${__dirname}/output`,
      filename: '[name].js'
    },
    optimization: {
      runtimeChunk: {
        name: 'manifest'
      }
    },
    plugins: (plugins => {
      plugins.push(
        new ProfilingAnalyzerPlugin(opts.profilingAnalyzerOptions)
      );

      if (opts.minify) {
        plugins.push(
          new webpack.optimize.UglifyJsPlugin({
            comments: false,
            mangle: true,
            compress: {
              warnings: false,
              negate_iife: false
            }
          })
        );
      }

      return plugins;
    })([])
  };
}