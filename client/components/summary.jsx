import React from 'react';
import { humanizeDuration } from './utils/formatters';

import styles from '../components/style/summary.less';

export default function Summary({ data }) {
  return (
    <>
      <h3> Summary </h3>
      <dl className={styles.summary}>
        <dt>General output time took:</dt>
        <dd>{humanizeDuration(data[0].misc)}</dd>

        <dt>Optimize assets time took:</dt>
        <dd>{humanizeDuration(data[0].optimize)}</dd>

        <dt style={{ paddingLeft: 8 }}>In context: </dt>
        <dd>{humanizeDuration(data[0].contextTime)}</dd>

        <dt style={{ paddingLeft: 8 }}>In node_modules: </dt>
        <dd>{humanizeDuration(data[0].nodeModulesTime)}</dd>
      </dl>
    </>
  );
}
