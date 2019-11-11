import * as WebSocket from 'ws';
import * as path from 'path';
import * as fs from 'fs';
import express from 'express';
import mkdir from 'mkdirp';
import http from 'http';
import opener from 'opener';
import { AddressInfo } from 'net';

import { createAssetsFilter, getRelativePath, getNodeModulesRelativePath } from './utils';
import { Folder, statsFolder, getFolderTime, getContextTime } from './analyze/folder';
import { ModuleProfiling, MISC, ModuleData } from './ProfilingAnalyzer';

const projectRoot = path.resolve(__dirname, '..');
const title = `${process.env.npm_package_name || 'Webpack Profiling Analyzer'} [${Date.now()}]`;

export interface Server {
  ws: WebSocket.Server;
  http: http.Server;
  updateProfileData: (data: {}, options: {}) => any;
}

export type ProfileData = {
  context: {[key: string]: ModuleData};
  loaders: Folder;
  misc: Folder;
  node_modules: Folder;
};

export function generateProfileData(context, stats, profilingMap: ModuleProfiling, options): ProfileData {
  const {excludeAssets = ['webpack/buildin', 'webpack-dev-server']} = options;
  const nodeModules = path.join(context, 'node_modules');

  const excludeAssetsFilter = createAssetsFilter(excludeAssets);
  const groupedProfilingMap = {
    misc: new Folder(),
    loaders: new Folder(),
    context: {},
    node_modules: new Folder(),
  };

  if (profilingMap[MISC]) {
    groupedProfilingMap.misc.addModule(profilingMap[MISC]);
  }

  for (const key in profilingMap) {
    if (excludeAssetsFilter(key)) {
      const module = profilingMap[key];

      if (module.loaders && module.loaders.length) {
        module.loaders.forEach(loader => {
          groupedProfilingMap.loaders.addModule(module, loader);
        });
      }

      if (key.includes(context) && !key.includes(nodeModules)) {
        groupedProfilingMap.context[getRelativePath(key, context)] = module;
      } else {
        groupedProfilingMap.node_modules.addModule(module, getNodeModulesRelativePath(key));
      }
    }
  }

  return groupedProfilingMap;
}


const emptyClientData = {
  stats: {},
  plugins: {},
  loaders: {},
  summary: {},
  raw: {},
};

type ClientData = typeof emptyClientData;

export async function generateClientData(profileData: ProfileData, options): Promise<ClientData> {
  if (!profileData) {
    return emptyClientData;
  }

  const miscTime = getFolderTime(profileData.misc);
  const { context } = profileData;
  const node_modules = statsFolder(profileData.node_modules.children['node_modules'])
  const nodeModulesTime = getFolderTime(profileData.node_modules.children['node_modules']);

  const contextTime = getContextTime(context);
  return {
    stats: {
      context,
      node_modules
    },
    plugins: {},
    raw: profileData,
    loaders: statsFolder(profileData.loaders),
    summary: [{
      type: 'summary',
      misc: miscTime,
      contextTime,
      nodeModulesTime,
    }],
  };
}

export async function generateStaticReport(profileData, options) {
  const {
    reportFileName = 'profile.json',
    bundleDir = null
  } = options;

  const reportFilePath = path.resolve(bundleDir || process.cwd(), reportFileName);

  mkdir.sync(path.dirname(reportFileName));
  fs.writeFileSync(reportFilePath, JSON.stringify(profileData, null, '\t'));
}

export async function startAnalyzerServer(profileData, options): Promise<Server> {
  const {
    port = 8888,
    host = '127.0.0.1',
    openBrowser = true,
    enableWebSocket = true
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
      enableWebSocket,
      escapeJson
    });
  });

  const server = http.createServer(app);

  await new Promise(resolve => {
    server.listen(port, host, () => {
      resolve();
      const url = `http://${host}:${(server.address() as AddressInfo).port}`;
      console.log(`Webpack Profiling Analyzer is started at ${url}`);

      if (openBrowser) {
        opener(url);
      }
    });
  });

  const wss = new WebSocket.Server({server});

  wss.on('connection', ws => {
    ws.on('error', err => {
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