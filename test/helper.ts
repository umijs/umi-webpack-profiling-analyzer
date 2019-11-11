import { use, expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as webpack from 'webpack';
import { ProfilingAnalyzer } from '../src/ProfilingAnalyzer';

use(require('chai-subset'));


(global as any).expect = expect;
(global as any).webpackCompile = webpackCompile;
(global as any).makeWebpackConfig = makeWebpackConfig;
(global as any).expectFile = expectFile;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function webpackCompile(config) {
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

export function makeWebpackConfig(opts) {
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
        new ProfilingAnalyzer(opts.profilingAnalyzerOptions)
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

export function expectFile(url) {
  const filePath = path.resolve(__dirname, url);
  const exists = fs.existsSync(filePath);
  expect(exists);
}