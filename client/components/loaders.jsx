import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { defs } from './charts/defines';
import { humanizeDuration } from './utils/formatters';
import { createTooltipWidthMapping } from './charts/tooltip';

export default function Loaders({ data, fill }) {
  const sliceLabel = React.useCallback(d => humanizeDuration(d.value), []);
  const tooltip = createTooltipWidthMapping({});

  return (
    <>
      <h3> Loaders </h3>
      <div
        style={{
          width: '100%',
          height: data.length * 20
        }}
      >
        <ResponsivePie
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          margin={{right: 200}}
          data={data.map(({ path, timeConsume }) => ({ id: path, label: path, value: timeConsume }))}
          colors={{scheme: 'nivo'}}
          defs={defs}
          tooltip={tooltip}
          fill={fill}
          legends={[
            {
              anchor: 'right',
              direction: 'column',
              translateX: 200 - 16,
              justify: false,
              itemsSpacing: 2,
              itemWidth: 200,
              itemHeight: 20,
              symbolSize: 12,
              itemOpacity: 0.85,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          motionStiffness={90}
          motionDamping={15}
          enableRadialLabels={false}
          slicesLabelsSkipAngle={30}
          sliceLabel={sliceLabel}
          sortByValue
          animate
        />
      </div>
    </>
  );
}