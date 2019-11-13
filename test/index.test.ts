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

  describe('webpack plugin', () => {
    it('webpack should use ProfilingAnalyzer as plugin', async () => {
      const config = makeWebpackConfig({
        multipleChunks: true,
        analyzerMode: 'static'
      });

      await webpackCompile(config);
      expectFile('output/profile.json');
    });
  });
});