const webpackProfilingAnalyzer = require('../lib');
const ProfilingAnalyzerPlugin = require('../lib/ProfilingAnalyzer').ProfilingAnalyzer;

describe('Profiling Analyzer Plugin', () => {
  describe('package exports correctly', () => {
    it('should export ProfilingAnalyze correctly', () => {
      expect(webpackProfilingAnalyzer);
    });
  });

  describe('options', () => {
    it('should be optional', () => {
      expect(() => new ProfilingAnalyzerPlugin()).not.to.throw();
    });
  });

  describe('webpack plugin', () => {
    it('webpack should use ProfilingAnalyzer as plugin', async () => {
      const config = makeWebpackConfig({
        multipleChunks: true
      });

      config.output.jsonpFunction = 'somethingCompletelyDifferent';

      await webpackCompile(config);
      expectFile('output/profile.json');
    });
  });
});