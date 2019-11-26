import React, { useMemo } from 'react';
import { humanizeDuration } from './utils/formatters';

import styles from '../components/style/viewer.less';

export function Suggestions({ data }) {
  const { stats } = data;
  const suggestions = useMemo(() => {
    const result = [];
    for (const key in stats) {
      if (stats.hasOwnProperty(key) && stats[key].outliers && stats[key].outliers.length) {
        result.push(
          <li key={key}>
            <h5>Slowest {key}</h5>
            {stats[key].outliers
              .sort((a, b) => b.timeConsume - a.timeConsume)
              .slice(0, 5)
              .map(({ path,  timeConsume}) =>
                <p key={path}>
                  {path}
                  <em>{humanizeDuration(timeConsume)}</em>
                </p>
              )
            }
          </li>
        )
      }
    }
    return result;
  }, [stats]);
  return <>
    <h3> Highlights: </h3>
    <ul className={styles.ul}>
      {suggestions}
    </ul>
  </>;
}
