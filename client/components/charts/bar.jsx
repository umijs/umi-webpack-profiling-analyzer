import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { defs } from './defines';

export default function BarChart({ data, keys, tooltip, fill, ...extraProps }) {
  return (
    <ResponsiveBar
      defs={defs}
      data={data}
      keys={keys}
      indexBy="type"
      margin={{left: 16, bottom: 24, right: 16}}
      layout="horizontal"
      groupMode="stacked"
      colors={['#61cdbb', '#f1e15b']}
      tooltip={tooltip}
      fill={fill}
      axisLeft={null}
      labelTextColor="inherit:darker(1.2)"
      motionStiffness={90}
      motionDamping={15}
      animate
      {...extraProps}
    />
  );
}
