const MS_IN_MINUTE = 60000;
const MS_IN_SECOND = 1000;

export function humanizeDuration(value) {
  const mins = Math.floor(value / MS_IN_MINUTE);
  const secondsRaw = (value - (mins * MS_IN_MINUTE)) / MS_IN_SECOND;
  const secondsWhole = Math.floor(secondsRaw);
  const remainderPrecision = secondsWhole > 0 ? 2 : 3;
  const secondsRemainder = Math.min(secondsRaw - secondsWhole, 0.99);
  const seconds = secondsWhole +
    secondsRemainder
      .toPrecision(remainderPrecision)
      .replace(/^0/u, '')
      .replace(/0+$/u, '')
      .replace(/^\.$/u, '');

  const tokens = [];

  if (mins > 0) {
    tokens.push(`${mins} min${mins > 1 ? 's' : ''}`);
  }

  tokens.push(`${seconds} secs`);

  return tokens.join(' ');
}