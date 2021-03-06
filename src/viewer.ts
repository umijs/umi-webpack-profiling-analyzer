import * as WebSocket from 'ws';
import * as path from 'path';
import * as express from 'express';
import * as http from 'http';
import * as opener from 'opener';
import { AddressInfo } from 'net';

import { createAssetsFilter, getRelativePath, getNodeModulesRelativePath, getLoadersIdentify } from './utils';
import { Folder, statsFolder, getFolderTime, getContextTime, FolderStats, moduleDataToFolderStats } from './analyze/folder';
import { ModuleProfiling, MISC, ModuleData, OPTIMIZE } from './ProfilingAnalyzer';
import { stats, Stats } from './analyze/stats';

const projectRoot = path.resolve(__dirname, '..');
const title = `${process.env.npm_package_name || 'Webpack Profiling Analyzer'} [${Date.now()}]`;

export interface Env {
  context: string;
}

export interface Server {
  ws: WebSocket.Server;
  server: http.Server;
  updateProfileData: (data: {}, options: {}, env: Env) => void;
}

export interface ProfileData {
  context: {[key: string]: ModuleData};
  loaders: Folder;
  misc: Folder;
  optimize: Folder;
  node_modules: Folder;
}

function escapeJson(json) {
  return JSON.stringify(json).replace(/</gu, '\\u003c');
}

export function generateProfileData(context, profilingMap: ModuleProfiling, options): ProfileData {
  const {excludeAssets = ['webpack/buildin', 'webpack-dev-server']} = options;
  const nodeModules = path.join(context, 'node_modules');

  const excludeAssetsFilter = createAssetsFilter(excludeAssets);
  const groupedProfilingMap = {
    misc: new Folder(),
    optimize: new Folder(),
    loaders: new Folder(),
    context: {},
    node_modules: new Folder(),
  };

  if (profilingMap[MISC]) {
    groupedProfilingMap.misc.addModule(profilingMap[MISC]);
  }

  if (profilingMap[OPTIMIZE]) {
    groupedProfilingMap.optimize.addModule(profilingMap[OPTIMIZE]);
  }

  for (const key in profilingMap) {
    if (excludeAssetsFilter(key)) {
      const module = profilingMap[key];

      if (module.loaders && module.loaders.length) {
        const loadersIdentify = getLoadersIdentify(module.loaders);
        groupedProfilingMap.loaders.addModule(module, loadersIdentify)
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

export interface ClientData {
  env: Env;
  raw?: {
    [key in 'context' | 'node_modules']: FolderStats[];
  };
  stats: Stats;
  plugins: {};
  loaders: FolderStats[];
  miscTime: number;
  optimizeTime: number;
  summary: unknown[];
}

const emptyClientData: ClientData = {
  env: {
    context: '',
  },
  stats: {},
  plugins: {},
  loaders: [],
  summary: [],
  miscTime: 0,
  optimizeTime: 0,
};

export function generateClientData(profileData: ProfileData, env: Env = { context: '' }): ClientData {
  if (!profileData) {
    return emptyClientData;
  }

  const miscTime = getFolderTime(profileData.misc);
  const optimizeTime = getFolderTime(profileData.optimize);
  const { context } = profileData;
  const node_modules = statsFolder(profileData.node_modules.children['node_modules'] as Folder);

  const nodeModulesTime = getFolderTime(profileData.node_modules.children['node_modules'] as Folder);
  const contextTime = getContextTime(context);

  const loaderRecord = statsFolder(profileData.loaders);
  const contextRecord = moduleDataToFolderStats(context);

  return {
    env,
    stats: {
      loaders: stats(loaderRecord),
      context: stats(contextRecord),
      node_modules: stats(node_modules),
    },
    raw: {
      context: contextRecord,
      node_modules,
    },
    miscTime,
    optimizeTime,
    plugins: {},
    loaders: loaderRecord,
    summary: [{
      type: 'summary',
      misc: miscTime,
      optimize: optimizeTime,
      contextTime,
      nodeModulesTime,
    }],
  };
}

export async function startAnalyzerServer(profileData, options, env = { context: '' }): Promise<Server> {
  const {
    port = 8888,
    host = '127.0.0.1',
    openBrowser = true,
    enableWebSocket = true
  } = options;

  if (!profileData) {
    return;
  }

  const clientData = generateClientData(profileData, env);

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

  const updateProfileData = async profileData => {
    if (!profileData) {
      return;
    }

    const clientData = generateClientData(profileData, env);

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
    server,
    updateProfileData
  };
}
