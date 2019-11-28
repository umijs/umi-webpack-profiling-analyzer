import { max, quantile } from 'simple-statistics';
import { FolderStats } from './folder';
import { fg, bg } from '../logger';
import { humanizeDuration } from '../utils';

export type Quantiles = [number, number, number];
export interface StatsResult {
  quantiles: Quantiles;
  max: number;
  outliers: FolderStats[];
}

export type Stats = {
  [key in 'context' | 'node_modules' | 'loaders' ]?: StatsResult;
}

/**
 * detect if value is an outlet value.
 *
 * if the value is over double inter quartile range
 * @param {number[]} quartiles
 * @param {number} value
 */
export function outlier(quartiles: Quantiles, value: number) {
  const interQuartileRange = quartiles[2] - quartiles[0];
  return value - quartiles[2] > interQuartileRange * 2;
}

/**
 * generate stats from data
 * @param folderStats folder name and time consume
 * @returns quantiles, max and outliers from stats
 */
export function stats(folderStats: FolderStats[]): StatsResult {

  if (!folderStats.length) {
    return {
      quantiles: null,
      max: Infinity,
      outliers: [],
    };
  }

  const data = folderStats.map(v => v.timeConsume);
  const quantiles: Quantiles = [quantile(data, 0.25), quantile(data, 0.5), quantile(data, 0.75) ];

  return {
    quantiles,
    max: max(data),
    outliers: folderStats.filter(d => outlier(quantiles, d.timeConsume)),
  };
}

export function humanizeStats(stats: Stats): string {
  const result = [];
  for (const key in stats) {
    if (stats.hasOwnProperty(key)) {
      const { outliers } = stats[key] as StatsResult;
      if (outliers.length) {
        result.push(
          `Slowest ${key} \n\t${outliers.sort((a, b) => b.timeConsume - a.timeConsume).slice(0, 5).map(o =>
            `${fg(humanizeDuration(o.timeConsume), o.timeConsume)} \t ${bg(o.path, 'whiteBright')}`
          ).join(',\n\t')}`
        );
      }
    }
  }

  return result.join('\n\n');
}