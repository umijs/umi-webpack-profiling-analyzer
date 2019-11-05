const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');
const {createAssetsFilter, getRelativePath, getNodeModulesRelativePath} = require('./utils');

module.exports = {
  generateProfileData
};

/**
 *
 * @param {string} context webpack compile context
 * @param {Stats} stats compile hooks stats
 * @param {Map<string, number>} profilingMap modules timing consuming of each modules
 */
async function generateProfileData(context, stats, profilingMap, options) {
  const {
    reportFileName = 'profile.json',
    bundleDir = null,
    excludeAssets = 'webpack/buildin'
  } = options;

  const excludeAssetsFilter = createAssetsFilter(excludeAssets);
  const groupedProfilingMap = {
    context: {},
    node_modules: {}
  };

  for (const key in profilingMap) {
    if (excludeAssetsFilter(key)) {
      if (key.includes(context)) {
        groupedProfilingMap.context[getRelativePath(key, context)] = profilingMap[key];
      } else {
        groupedProfilingMap.node_modules[getNodeModulesRelativePath(key)] = profilingMap[key];
      }
    }
  }

  const reportFilePath = path.resolve(bundleDir || process.cwd(), reportFileName);

  mkdir.sync(path.dirname(reportFileName));
  fs.writeFileSync(reportFilePath, JSON.stringify(groupedProfilingMap, null, '\t'));
}
