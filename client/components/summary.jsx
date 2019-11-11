import React from 'react';
import { humanizeDuration } from './utils/formatters';

export default function Summary({ data }) {
  return (
    <>
      <h3> Summary </h3>
      <p>General output time took {humanizeDuration(data[0].misc)}</p>
    </>
  );
}
