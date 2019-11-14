import { describe, it } from 'mocha';
import * as webpackProfilingAnalyzer from '../src';
import { ProfilingAnalyzer } from '../src/ProfilingAnalyzer';
import { expect } from 'chai';
import { makeWebpackConfig, webpackCompile, expectFile } from './helper';

describe('Profiling Analyzer Plugin', () => {
  describe('package exports correctly', () => {
    it('should export ProfilingAnalyze correctly', () => {
      expect(webpackProfilingAnalyzer);
    });
  });

  describe('options', () => {
    it('should be optional', () => {
      expect(() => new ProfilingAnalyzer()).not.to.throw();
    });
  });

  describe('webpack should use ProfilingAnalyzer as plugin', () => {

    it('static report', async () => {
      const config = makeWebpackConfig({
        profilingAnalyzerOptions: {
          analyzerMode: 'static'
        }
      });

      await webpackCompile(config);
      expectFile('output/profile.json');
    });

    it('report', async () => {
      const config = makeWebpackConfig({
        profilingAnalyzerOptions: {
          analyzerMode: 'none'
        }
      });
      await webpackCompile(config);
      expect(true);
    });
  });
});