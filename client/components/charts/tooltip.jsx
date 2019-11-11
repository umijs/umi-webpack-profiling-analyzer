import React from 'react';
import { humanizeDuration } from '../utils/formatters';

export function createTooltipWidthMapping(mapping, primaryKey = 'id') {
  return function Tooltip(props) {
    const { value, color } = props;
    const primaryProperty = props[primaryKey];

    return (
      <div style={{whiteSpace: 'pre', display: 'flex', alignItems: 'center', fontSize: 14}}>
        <span style={{display: 'block', background: color, width: 12, height: 12}}/>
        <span style={{marginLeft: 8}}>
          {mapping && mapping[primaryProperty] ? mapping[primaryProperty] : primaryProperty}: {humanizeDuration(value)}
        </span>
      </div>
    );
  };
};