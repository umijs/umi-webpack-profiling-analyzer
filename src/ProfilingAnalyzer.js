
class ProfilingAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    this.compiler = compiler;

    function done(stats, callback) {
      callback = callback || (() => {});
      console.log('done', stats, callback);


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