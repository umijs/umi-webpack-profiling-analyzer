import { useOrdinalColorScale } from '@nivo/colors';

export default function createColorScale(key) {
  return useOrdinalColorScale({ scheme: 'nivo' }, key);
}

export const fontStyles = {
  fontFamily: 'Cascadia Code',
};
