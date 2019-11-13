import React from 'react';
import { createTooltipWidthMapping } from './charts/tooltip';
import BarChart from './charts/bar';
import CustomBarComponent from './charts/customBar';
import createColorScale from './charts/colors';
import { fillTop3 } from './charts/defines';

import { humanizeDuration } from './utils/formatters';

import styles from './style/viewer.less';

const mappings = {
  contextTime: 'Modules In Webpack Context',
  nodeModulesTime: 'Modules in node_modules'
};

function procedureData(data) {
  return data.map(({ path, timeConsume }) => ({
    key: path,
    value: timeConsume
  }))
    .sort((a, b) => a.value - b.value)
    .slice(-10);
}

export default function Modules({ data }) {
  const tooltip = createTooltipWidthMapping(mappings);
  const childTooltip = createTooltipWidthMapping({}, 'indexValue');

  const { context, node_modules: nodeModules } = data.stats;

  const contextData = React.useMemo(() => procedureData(context), [context]);
  const nodeModulesData = React.useMemo(() => procedureData(nodeModules), [ nodeModules ]);

  const getColor = createColorScale('indexValue');

  function label(v) {
    return `${v.indexValue}: ${humanizeDuration(v.value)}`;
  }

  return (
    <>
      <h3> Module Times</h3>
      <div style={{width: '100%', height: 90}} >
        <BarChart
          data={data.summary}
          keys={['contextTime', 'nodeModulesTime']}
          tooltip={tooltip}
          label={v => humanizeDuration(v.value)}
          fill={[
            {
              match: {
                id: 'contextTime'
              },
              id: 'dots'
            },
            {
              match: {
                id: 'nodeModulesTime'
              },
              id: 'lines'
            }
          ]}
          axisBottom={{
            tickSize: 5,
            tickValues: 5,
            tickPadding: 5,
            tickRotation: 0,
            format: humanizeDuration
          }}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <h4>In context</h4>
          <div style={{ height: 300, width: '80%' }}>
            <BarChart
              margin={{left: 16, top: 24, right: 16}}
              data={contextData}
              keys={['value']}
              indexBy="key"
              groupMode="grouped"
              colors={getColor}
              tooltip={childTooltip}
              fill={fillTop3(contextData)}
              axisTop={{
                enable: true,
                tickValues: 4,
                tickPadding: 5,
                tickRotation: 0,
                format: humanizeDuration
              }}
              axisBottom={null}
              label={label}
              padding={0.1}
              enableGridY={false}
              enableGridX={false}
              barComponent={CustomBarComponent}
            />
          </div>
        </div>

        <div className={styles.col}>
          <h4>In node_modules</h4>
          <div style={{ height: 300, width: '80%' }}>
            <BarChart
              margin={{left: 16, top: 25, right: 16}}
              data={nodeModulesData}
              keys={['value']}
              indexBy="key"
              groupMode="grouped"
              colors={getColor}
              tooltip={childTooltip}
              fill={fillTop3(contextData)}
              axisTop={{
                enable: true,
                tickValues: 4,
                tickPadding: 5,
                tickRotation: 0,
                format: humanizeDuration
              }}
              axisBottom={null}
              label={label}
              padding={0.1}
              enableGridY={false}
              enableGridX={false}
              barComponent={CustomBarComponent}
            />
          </div>
        </div>
      </div>
    </>
  );
}
