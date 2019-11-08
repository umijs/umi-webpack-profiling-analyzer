const viewer = require('./viewer');
const {getModuleName, getModuleLoaders, generateStaticReport} = require('./utils');

const HOOKS_NS = 'ProfilingAnalyzer';

class ProfilingAnalyzer {
  constructor(options = {}) {
    this.options = {
      analyzerMode: 'server',
      ...options
    };
    this.moduleProfiling = {};
  }

  moduleEnter(module) {
    const name = getModuleName(module);
    const loaders = getModuleLoaders(module);
    if (! this.moduleProfiling[name]) {
      this.moduleProfiling[name] = {
        loaders,
        start: Date.now()
      };
    }
  }

  moduleSuccessed(module) {
    const name = getModuleName(module);
    const loaders = getModuleLoaders(module);

    if (this.moduleProfiling[name]) {
      this.moduleProfiling[name].end = Date.now();
      this.moduleProfiling[name].timeConsume = Date.now() - this.moduleProfiling[name].start;
    } else {
      this.moduleProfiling[name] = {
        loaders: getModuleLoaders(loaders),
        timeConsume: Date.now() - module.buildTimestamp
      };
    }
  }

  done(stats, callback) {
    setImmediate(async () => {
      try {
        await this.generateProfileData(stats);
        callback();
      } catch (e) {
        callback(e);
      }
    });
  }

  apply(compiler) {
    this.compiler = compiler;

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
  async generateStaticReport(profileData) {
    return generateStaticReport(profileData, this.options);
  }

  /**
   * start local server to display stats report
   * @param {object} profileData Profile data
   */
  async startAnalyzerServer(profileData) {
    if (this.server) {
      await this.server.updateProfileData(profileData, this.options);
    } else {
      this.server = await viewer.startAnalyzerServer(profileData, this.options);
    }

  }

  /**
   * generater stats data
   * @param {*} stats webpack stats data
   */
  async generateProfileData(stats) {
    const {context} = this.compiler;
    const {analyzerMode} = this.options;

    const profileData = await viewer.generateProfileData(context, stats, this.moduleProfiling, this.options);

    if (analyzerMode === 'server') {
      await this.startAnalyzerServer(profileData);
    } else {
      await this.generateStaticReport(profileData);
    }
  }
}

module.exports = ProfilingAnalyzer;