import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import { Compiler } from 'webpack';

import { startAnalyzerServer, generateProfileData, Server, generateClientData } from './viewer';
import { getModuleName, getModuleLoaders, generateStaticReport, humanizeDuration } from './utils';
import { Logger, bg, fg, ansiChart } from './logger';
import { humanizeStats } from './analyze/stats';

const HOOKS_NS = 'ProfilingAnalyzer';
export const MISC = Symbol('misc');
export const OPTIMIZE = Symbol('optimize');
export const NS = path.dirname(fs.realpathSync(__filename));

export interface ProfilingAnalyzerOptions {
  analyzerMode: 'server' | 'static';
  logger: Logger;
  reportFileName?: string;
  dumpProfileData?: boolean;
}

export interface ModuleData {
  timeConsume?: number;
  loaders: string[];
  start: number;
  end: number;
}

export interface ModuleProfiling {
  [MISC]?: ModuleData;
  [OPTIMIZE]?: ModuleData;
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

  public startOptimize() {
    this.moduleProfiling[OPTIMIZE] = {
      loaders: [],
      start: Date.now(),
      end: null,
    };
  }

  public afterOptimize() {
    this.moduleProfiling[OPTIMIZE].end = Date.now();
  }

  public moduleSuccessed(module) {
    const name = getModuleName(module);
    if (this.moduleProfiling[name]) {
      this.moduleProfiling[name].end = Date.now();
      this.moduleProfiling[name].timeConsume = Date.now() - this.moduleProfiling[name].start;
    }
  }

  public done(_, callback) {
    this.moduleProfiling[MISC].end = Date.now();
    this.moduleProfiling[MISC].timeConsume = this.moduleProfiling[MISC].end - this.moduleProfiling[MISC].start;
    setImmediate(async () => {
      try {
        await this.generateProfileData();
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

      // stats optimize time
      compilation.hooks.optimizeChunkAssets.tap(`${HOOKS_NS}:startOptimizeAssets`, this.startOptimize.bind(this));
      compilation.hooks.afterOptimizeChunkAssets.tap(`${HOOKS_NS}:afterOptimizeAssets`, this.afterOptimize.bind(this))
    });

    compiler.hooks.done.tapAsync(`${HOOKS_NS}:done`, this.done.bind(this));
  }

  /**
   * generater static report json file
   * @param {object} profileData Profile data
   */
  public async generateStaticReport(profileData, options: Partial<ProfilingAnalyzerOptions> = this.options) {
    return generateStaticReport(profileData, options);
  }

  public generateConsoleOutput(profileData, env) {
    const clientData = generateClientData(profileData, env);
    const { miscTime, optimizeTime, loaders, raw, stats } = clientData;

    return this.options.logger.log([
      bg('Webpack Build Time Analyze'),
      '',
      bg('Highlights:', 'whiteBright'),
      humanizeStats(stats),
      '',
      `General output time took: ${bg(fg(humanizeDuration(miscTime), miscTime))}`,
      `Optimize assets time took ${bg(fg(humanizeDuration(optimizeTime), optimizeTime))}`,
      `Loaders:`,
      ansiChart(loaders, stats.loaders, { row: 'path', value: 'timeConsume' }),
      'Top 5 context modules:',
      ansiChart(raw.context, stats.context, { row: 'path', value: 'timeConsume' }, { limit: 5 }),
      'Top 5 node_modules modules:',
      ansiChart(raw.node_modules, stats.node_modules, { row: 'path', value: 'timeConsume' }, { limit: 5 })
    ]);
  }

  /**
   * start local server to display stats report
   * @param {object} profileData Profile data
   */
  public async startAnalyzerServer(profileData, env) {
    if (this.server) {
      await this.server.updateProfileData(profileData, this.options, env);
    } else {
      this.server = await startAnalyzerServer(profileData, this.options, env);
    }
  }

  /**
   * generater stats data
   * @param {*} stats webpack stats data
   */
  public async generateProfileData() {
    const { context } = this.compiler;
    const { analyzerMode } = this.options;
    const profileData = generateProfileData(context, this.moduleProfiling, this.options);
    const env = {
      context: this.compiler.context,
    };

    if (this.options.dumpProfileData) {
      await this.generateStaticReport(this.moduleProfiling, { reportFileName: 'dump.json' });
    }

    switch (analyzerMode) {
      case 'server':
        await this.startAnalyzerServer(profileData, env);
        break;
      case 'static':
        await this.generateStaticReport(profileData);
        break;
      default:
        this.generateConsoleOutput(profileData, env);
    }
  }
}
