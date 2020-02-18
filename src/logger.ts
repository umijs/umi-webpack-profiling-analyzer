import * as chalk from 'chalk';
import { humanizeDuration } from './utils';
import { StatsResult } from './analyze/stats';
import { FolderStats } from './analyze/folder';

export class Logger {

  public log(log: string[], options?: {}) {
    const logs = Array.isArray(log) ? log : [ log ];

    this._log('\n');
    this._log(logs.join('\r\n'));
    this._log('\n');
  }

  private _log(str: string) {
    return console.log(str);
  }
}

export interface AnsiChartConfig<T, U = keyof T> {
  row: U;
  value: U;
}
export function bg(text: string, fn = 'cyan') {
  return chalk.bgBlack[fn](text);
}

export function fg(text, time) {
  let modifier = chalk.bold;
  if (time > 10000) {
    modifier = modifier.red;
  } else if (time > 2000) {
    modifier = modifier.yellow;
  } else {
    modifier = modifier.green;
  }

  return modifier(text);
}


export function ansiChart(
  data: FolderStats[],
  highlights: StatsResult,
  { row, value }: AnsiChartConfig<FolderStats>,
  options?: { limit: number },
): string {
  const maxWidth = 10;
  const shortedData = data.sort((a, b) => Number(b[value]) - Number(a[value]));
  const limitedData = options && options.limit ? shortedData.slice(0, options.limit) : shortedData;

  return limitedData.map(item => {
    const label = item[row];
    const v = Number(item[value]);
    const barLength = Math.max(1, Math.round(v * maxWidth / highlights.max));
    const padLength = 10 - barLength;
    const barColor = highlights.outliers.find(({ path }) => path === label) ? chalk.yellowBright : chalk.greenBright;
    return [
      '  ',
      barColor(new Array(barLength).fill('▇').join('')),
      new Array(padLength).fill(' ').join(''),
      '    ',
      `[${fg(humanizeDuration(v), v)}] - ${label}`
    ].join('');
  }).join('\n');
}
