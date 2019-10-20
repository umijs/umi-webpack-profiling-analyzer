
class ProfilingAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    this.compiler = compiler;

    function done(curCompiler, callback) {
      callback = callback || (() => {});
      console.log('done', curCompiler.getStats().toJson());

      callback();
    }

    if (compiler.hooks) {
      compiler.hooks.done.tapAsync('webpack-bundle-analyzer', done);
    } else {
      compiler.plugin('done', done);
    }
  }
}

module.exports = ProfilingAnalyzer;