const chai = require('chai');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const ProfilingAnalyzerPlugin = require('../lib/ProfilingAnalyzer').ProfilingAnalyzer;

chai.use(require('chai-subset'));

global.expect = chai.expect;
global.webpackCompile = webpackCompile;
global.makeWebpackConfig = makeWebpackConfig;
global.expectFile = expectFile;

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
      bundleDir: `${__dirname}/output`
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
    stats: {
      modules: true
    },
    optimization: {
      runtimeChunk: {
        name: 'manifest'
      }
    },
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
        }
      ]
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

function expectFile(url) {
  const filePath = path.resolve(__dirname, url);
  const exists = fs.existsSync(filePath);
  expect(exists);
}