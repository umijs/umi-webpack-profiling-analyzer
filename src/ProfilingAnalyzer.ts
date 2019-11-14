import { Compiler } from 'webpack';

import { startAnalyzerServer, generateProfileData, Server, generateClientData } from './viewer';
import { getModuleName, getModuleLoaders, generateStaticReport, humanizeDuration } from './utils';
import { Logger, bg, fg, ansiChart } from './logger';

const HOOKS_NS = 'ProfilingAnalyzer';
export const MISC = Symbol('misc');

export interface ProfilingAnalyzerOptions {
  analyzerMode: 'server' | 'static';
  logger: Logger;
}

import * as _ from 'lodash';
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
    this.options = _.merge({
      analyzerMode: 'server',
      logger: new Logger(),
    }, options);
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
    if (this.moduleProfiling[name]) {
      this.moduleProfiling[name].end = Date.now();
      this.moduleProfiling[name].timeConsume = Date.now() - this.moduleProfiling[name].start;
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

  public generateConsoleOutput(profileData) {
    const clientData = generateClientData(profileData, this.options);
    const { miscTime, loaders, stats } = clientData;

    return this.options.logger.log([
      bg('Webpack Build Time Analyze'),
      `General output time took: ${bg(fg(humanizeDuration(miscTime), miscTime))}`,
      `Loaders:`,
      ansiChart(loaders, { row: 'path', value: 'timeConsume' }),
      'Top 5 context modules:',
      ansiChart(stats.context, { row: 'path', value: 'timeConsume' }, { limit: 5 }),
      'Top 5 node_modules modules:',
      ansiChart(stats.node_modules, { row: 'path', value: 'timeConsume' }, { limit: 5 })
    ]);
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
    switch (analyzerMode) {
      case 'server':
        await this.startAnalyzerServer(profileData);
        break;
      case 'static':
        await this.generateStaticReport(profileData);
        break;
      default:
        this.generateConsoleOutput(profileData);
    }
  }
}
