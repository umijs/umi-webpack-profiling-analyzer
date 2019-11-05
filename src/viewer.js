const path = require('path');
const fs = require('fs');
const express = require('express');
const mkdir = require('mkdirp');
const http = require('http');
const opener = require('opener');
const {createAssetsFilter, getRelativePath, getNodeModulesRelativePath} = require('./utils');

const projectRoot = path.resolve(__dirname, '..');
// const assetsRoot = path.join(projectRoot, 'public');
const title = `${process.env.npm_package_name || 'Webpack Profiling Analyzer'} [${Date.now()}]`;

module.exports = {
  generateProfileData,
  generateStaticReport,
  startAnalyzerServer
};

/**
 *
 * @param {string} context webpack compile context
 * @param {Stats} stats compile hooks stats
 * @param {Map<string, number>} profilingMap modules timing consuming of each modules
 */
async function generateProfileData(context, stats, profilingMap, options) {
  const {excludeAssets = ['webpack/buildin', 'webpack-dev-server']} = options;

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

  return groupedProfilingMap;
}

async function generateStaticReport(profileData, options) {
  const {
    reportFileName = 'profile.json',
    bundleDir = null
  } = options;

  const reportFilePath = path.resolve(bundleDir || process.cwd(), reportFileName);

  mkdir.sync(path.dirname(reportFileName));
  fs.writeFileSync(reportFilePath, JSON.stringify(profileData, null, '\t'));
}

async function startAnalyzerServer(profileData, options) {
  const {
    port = 8888,
    host = '127.0.0.1',
    openBrowser = true
  } = options;

  if (!profileData) {
    return;
  }

  const app = express();

  app.engine('ejs', require('ejs').renderFile);
  app.set('view engine', 'ejs');
  app.set('views', `${projectRoot}/views`);
  app.use(express.static(`${projectRoot}/public`));

  app.use('/', (req, res) => {
    res.render('viewer', {
      mode: 'server',
      title,
      get profileData() {
        return profileData;
      },
      // helpers
      escapeJson
    });
  });

  const server = http.createServer(app);

  await new Promise(resolve => {
    server.listen(port, host, () => {
      resolve();
      const url = `http://${host}:${server.address().port}`;
      console.log(`Webpack Profiling Analyzer is started at ${url}`);

      if (openBrowser) {
        opener(url);
      }
    });
  });

}

function escapeJson(json) {
  return JSON.stringify(json).replace(/</gu, '\\u003c');
}