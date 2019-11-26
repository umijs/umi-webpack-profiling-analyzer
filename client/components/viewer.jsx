import React from 'react';
import Summary from './summary';
import Modules from './modules';
import Loaders from './loaders';
import { defs } from './charts/defines';
import { Suggestions } from './suggestions';

import styles from './style/viewer.less';
import { humanizeDuration } from './utils/formatters';

export default function Viewer({ data }) {

  const loadersMapping = React.useMemo(() => {
    const sortedLoaders = data.loaders.sort((a, b) => b.timeConsume - a.timeConsume).slice(0, 3);
    return sortedLoaders.map(({ path }, index) => {
      return {
        match: d => {
          if (d.data.id === path) {
            return true;
          }
          return d.data && d.data.data && d.data.data.id === path;
        },
        id: defs[index].id
      };
    });
  }, [data]);

  return (
    <div className={styles.viewer}>
      <h2>
        <em>[{humanizeDuration(data.summary[0].misc)}]</em>
        Webpack Build Time Analyze
      </h2>
      <p>
        <em>context: {data.env.context}</em>
      </p>

      <div className={styles.row}>
        <div className={styles.col}>
          <Suggestions data={data} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <Summary data={data.summary} />
        </div>
        <div className={styles.col}>
          <Loaders data={data.loaders} fill={loadersMapping} />
        </div>
      </div>
      <Modules data={data} fill={loadersMapping} />
    </div>
  );
}
