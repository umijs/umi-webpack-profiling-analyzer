const viewer = require('./viewer');
const {getModuleName, getModuleLoaders} = require('./utils');

const HOOKS_NS = 'ProfilingAnalyzer';

class ProfilingAnalyzer {
  constructor(options = {}) {
    this.options = options;
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

  async generateProfileData(stats) {
    const {context} = this.compiler;
    await viewer.generateProfileData(context, stats, this.moduleProfiling, this.options);
  }
}

module.exports = ProfilingAnalyzer;