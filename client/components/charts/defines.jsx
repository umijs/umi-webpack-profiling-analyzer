import React from 'react';

export const defs = [{
  id: 'dots',
  type: 'patternDots',
  background: 'inherit',
  color: 'rgba(0, 0, 0, .15)',
  size: 4,
  padding: 1,
  stagger: true
},
{
  id: 'lines',
  type: 'patternLines',
  background: 'inherit',
  color: 'rgba(255, 255, 255, 0.15)',
  rotation: -45,
  lineWidth: 6,
  spacing: 10
},
{
  id: 'squares',
  type: 'patternSquares',
  background: 'inherit',
  color: 'rgba(0, 0, 0, 0.15)',
  size: 4,
  padding: 4,
  stagger: false
}];

export function fillTop3(series, getValue = v => v.data.index) {
  return ['lines', 'dots', 'squares'].map((id, index) => ({
    match: d => getValue(d) === series.length - (index + 1),
    id
  }));
}