const path = require('path');
const fs = require('fs');
const express = require('express');
const mkdir = require('mkdirp');
const http = require('http');
const opener = require('opener');

const WebSocket = require('ws');

const {createAssetsFilter, getRelativePath, getNodeModulesRelativePath} = require('./utils');
const {Folder} = require('./analyze/folder');

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
  const nodeModules = path.join(context, 'node_modules');

  const excludeAssetsFilter = createAssetsFilter(excludeAssets);
  const groupedProfilingMap = {
    context: new Folder(),
    node_modules: new Folder()
  };

  for (const key in profilingMap) {
    if (excludeAssetsFilter(key)) {
      if (key.includes(context) && !key.includes(nodeModules)) {
        groupedProfilingMap.context.addModule(getRelativePath(key, context), profilingMap[key]);
      } else {
        groupedProfilingMap.node_modules.addModule(getNodeModulesRelativePath(key), profilingMap[key]);
      }
    }
  }

  return groupedProfilingMap;
}

async function generateClientData(profileData, options) {
  if (!profileData) {
    return {};
  }

  return profileData;
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

  const clientData = await generateClientData(profileData, options);

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
        return clientData;
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

  const wss = new WebSocket.Server({server});

  wss.on('connection', ws => {
    ws.on('error', err => {
      // Ignore network errors like `ECONNRESET`, `EPIPE`, etc.
      if (err.errno) return;

      console.info(err.message);
    });
  });

  const updateProfileData = async (profileData, options) => {
    if (!profileData) {
      return;
    }

    const clientData = await generateClientData(profileData, options);

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          event: 'profileDataUpdate',
          data: clientData
        }));
      }
    });
  };

  return {
    ws: wss,
    http: server,
    updateProfileData
  };
}

function escapeJson(json) {
  return JSON.stringify(json).replace(/</gu, '\\u003c');
}