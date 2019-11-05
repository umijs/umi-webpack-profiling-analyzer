const {inspect} = require('util');
const _ = require('lodash');

function createAssetsFilter(excludePatterns) {
  const excludeFunctions = _(excludePatterns)
    .castArray()
    .compact()
    .map(pattern => {
      if (typeof pattern === 'string') {
        pattern = new RegExp(pattern, 'u');
      }

      if (_.isRegExp(pattern)) {
        return (asset) => pattern.test(asset);
      }

      if (!_.isFunction(pattern)) {
        throw new TypeError(
          `Pattern should be either string, RegExp or a function, but "${inspect(pattern, {depth: 0})}" got.`
        );
      }

      return pattern;
    })
    .value();

  if (excludeFunctions.length) {
    return (asset) => _.every(excludeFunctions, fn => fn(asset) !== true);
  } else {
    return () => true;
  }
}

/**
 * inspired from speed-measure-webpack-plugin
 * @param {*} loaders loaders
 */
function getModuleLoaders(module) {
  return module.loaders && module.loaders.length
    ? module.loaders
      .map(l => l.loader || l)
      .map(l =>
        l.replace(
          /^.*\/node_modules\/(@[a-z0-9][\w-.]+\/[a-z0-9][\w-.]*|[^\/]+).*$/,
          (_, m) => m
        )
      )
      .filter(l => !l.includes('umi-webpack-profiling-analyzer'))
    : ['modules with no loaders'];
}

/**
 * get module userRequest and get path from loader request path
 * e.g. node_modules/less-loader/dist/cjs.js??ref--4-2!/src/c.less => /src/c.less
 * @param {*} module
 */
function getModuleName(module) {
  return module.userRequest.replace(
    /^.*\/(@[a-z0-9][\w-.]+\/[a-z0-9][\w-.]*|[^\/]+)\?\?(@[a-z0-9][\w-.]+\/[a-z0-9][\w-.]*|[^\/]+)!/,
    '',
  );
}

/**
 * get relateive path from context
 * @param {string} path raw path
 * @param {string} context webpack context path
 */
function getRelativePath(path, context) {
  return path.replace(context + '/', '');
}

function getNodeModulesRelativePath(path) {
  return path.replace(/^.*\/(node_modules\/)/, (_, m) => m);
}

module.exports = {
  createAssetsFilter,
  getModuleLoaders,
  getModuleName,
  getRelativePath,
  getNodeModulesRelativePath
};
