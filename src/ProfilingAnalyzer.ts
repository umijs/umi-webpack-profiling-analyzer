import { Compiler } from 'webpack';

import { startAnalyzerServer, generateProfileData, Server } from './viewer';
import { getModuleName, getModuleLoaders, generateStaticReport } from './utils';

const HOOKS_NS = 'ProfilingAnalyzer';
export const MISC = Symbol('misc');

export interface ProfilingAnalyzerOptions {
  analyzerMode: 'server' | 'client';
}

export interface ModuleData {
  timeConsume?: number;
  loaders: string[];
  start: number;
  end: number;
}

export interface ModuleProfiling {
  [MISC]?: ModuleData;
  [key: string]: ModuleData;
}

export class ProfilingAnalyzer {
  private options: ProfilingAnalyzerOptions;
  private moduleProfiling: ModuleProfiling;
  private compiler: Compiler;
  private server: Server;

  public constructor(options = {}) {
    this.options = {
      analyzerMode: 'server',
      ...options
    };
    this.moduleProfiling = {};
  }

  public moduleEnter(module) {
    const name = getModuleName(module);
    const loaders = getModuleLoaders(module);

    this.moduleProfiling[name] = {
      loaders,
      start: Date.now(),
      end: null,
    };
  }

  public moduleSuccessed(module) {
    const name = getModuleName(module);
    const loaders = getModuleLoaders(module);
    if (this.moduleProfiling[name]) {
      this.moduleProfiling[name].end = Date.now();
      this.moduleProfiling[name].timeConsume = Date.now() - this.moduleProfiling[name].start;
    } else {
      const start = module.buildTimestamp;
      this.moduleProfiling[name] = {
        loaders: getModuleLoaders(loaders),
        start,
        end: Date.now(),
        timeConsume: start,
      };
    }
  }

  public done(stats, callback) {
    this.moduleProfiling[MISC].end = Date.now();
    this.moduleProfiling[MISC].timeConsume = this.moduleProfiling[MISC].end - this.moduleProfiling[MISC].start;
    setImmediate(async () => {
      try {
        await this.generateProfileData(stats);
        callback();
      } catch (e) {
        console.error('Profiling Analyze Error', e);
        callback(e);
      }
    });
  }

  public apply(compiler) {
    this.compiler = compiler;
    compiler.hooks.compile.tap(`${HOOKS_NS}:start`, () => {
      this.moduleProfiling[MISC] = {
        loaders: [],
        start: Date.now(),
        end: null,
      };
    });

    compiler.hooks.compilation.tap(`${HOOKS_NS}:beforeRun`, compilation => {
      compilation.hooks.buildModule.tap(`${HOOKS_NS}:buildModule`, this.moduleEnter.bind(this));
      compilation.hooks.succeedModule.tap(`${HOOKS_NS}:successedModule`, this.moduleSuccessed.bind(this));
    });

    compiler.hooks.done.tapAsync(`${HOOKS_NS}:done`, this.done.bind(this));
  }

  /**
   * generater static report json file
   * @param {object} profileData Profile data
   */
  public async generateStaticReport(profileData) {
    return generateStaticReport(profileData, this.options);
  }

  /**
   * start local server to display stats report
   * @param {object} profileData Profile data
   */
  public async startAnalyzerServer(profileData) {
    if (this.server) {
      await this.server.updateProfileData(profileData, this.options);
    } else {
      this.server = await startAnalyzerServer(profileData, this.options);
    }

  }

  /**
   * generater stats data
   * @param {*} stats webpack stats data
   */
  public async generateProfileData(stats) {
    const { context } = this.compiler;
    const { analyzerMode } = this.options;

    const profileData = generateProfileData(context, stats, this.moduleProfiling, this.options);
    if (analyzerMode === 'server') {
      await this.startAnalyzerServer(profileData);
    } else {
      await this.generateStaticReport(profileData);
    }
  }
}
