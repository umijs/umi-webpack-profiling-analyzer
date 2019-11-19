import React from 'react';
import compose from 'recompose/compose';
import withPropsOnChange from 'recompose/withPropsOnChange';
import pure from 'recompose/pure';
import { BasicTooltip } from '@nivo/tooltip';
import { fontStyles } from './colors';

function CustomBarComponent({
  x, y, width, height, color, label, data, borderRadius,
  borderWidth, borderColor,
  labelColor,
  theme,
  tooltip,
  showTooltip,
  hideTooltip,
  onMouseEnter,
  onMouseLeave
}) {

  const handleTooltip = e => showTooltip(tooltip, e);
  const handleMouseEnter = e => {
    onMouseEnter(data, e);
    showTooltip(tooltip, e);
  };

  const handleMouseLeave = e => {
    onMouseLeave(data, e);
    hideTooltip(e);
  };

  return (
    <g transform={`translate(${x}, ${y})`} >
      <rect
        width={width}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill={data.fill ? data.fill : color}
        strokeWidth={borderWidth}
        stroke={borderColor}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleTooltip}
        onMouseLeave={handleMouseLeave}
      />
      <g>
        <text
          x={12}
          y={height / 2}
          textAnchor="start"
          alignmentBaseline="central"
          style={{
            ...theme.labels.text,
            ...fontStyles,
            pointerEvents: 'none',
            fill: labelColor,
          }}
        >
          {label}
        </text>
      </g>
    </g>
  );
}

const enhance = compose(
  withPropsOnChange(['data', 'color', 'onClick'], ({ data, color, onClick }) => ({
    onClick: event => onClick({ color, ...data }, event)
  })),
  withPropsOnChange(
    ['data', 'color', 'theme', 'tooltip', 'getTooltipLabel', 'tooltipFormat'],
    ({ data, color, theme, tooltip, getTooltipLabel, tooltipFormat }) => ({
      tooltip: (
        <BasicTooltip
          id={getTooltipLabel(data)}
          value={data.value}
          color={color}
          theme={theme}
          format={tooltipFormat}
          renderContent={
            typeof tooltip === 'function'
              ? tooltip.bind(null, { color, theme, ...data })
              : null
          }
          enableChip
        />
      )
    })
  ),
  pure
);

export default enhance(CustomBarComponent);
