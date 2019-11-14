import chalk from 'chalk';
import { humanizeDuration } from './utils';

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
export function bg(text: string) {
  return chalk.bgBlack.cyan(text);
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


export function ansiChart<T extends object>(
  data: T[],
  { row, value }: AnsiChartConfig<T>,
  options?: { limit: number },
): string {
  const maxWidth = 10;
  const shortedData = data.sort((a, b) => Number(b[value]) - Number(a[value]));
  const limitedData = options && options.limit ? shortedData.slice(0, options.limit) : shortedData;

  const { sum, max } = limitedData.reduce((prev, item) => {
    const v = Number(item[value]);
    return {
      max: Math.max(prev.max, v),
      sum: prev.sum + v,
    };
  }, { max: -Infinity, sum: 0 });

  return limitedData.map(item => {
    const label = item[row];
    const v = Number(item[value]);
    const barLength = Math.max(1, Math.round(v * maxWidth / max));
    const padLength = 10 - barLength;
    const barColor = v > sum * 1.5 / limitedData.length ? chalk.yellowBright : chalk.greenBright;
    return [
      '  ',
      barColor(new Array(barLength).fill('▇').join('')),
      new Array(padLength).fill(' ').join(''),
      '    ',
      `[${fg(humanizeDuration(v), v)}] - ${label}`
    ].join('');
  }).join('\n');
}
