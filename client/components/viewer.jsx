import React from 'react';
import Summary from './summary';
import Modules from './modules';
import Loaders from './loaders';
import { defs } from './charts/defines';
import styles from './style/viewer.less';

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
        Webpack Build Time Analyze
      </h2>

      <div className={styles.row}>
        <div className={styles.col}>
          <Summary data={data.summary}/>
        </div>
        <div className={styles.col}>
          <Loaders data={data.loaders} fill={loadersMapping} />
        </div>
      </div>
      <Modules data={data} fill={loadersMapping} />
    </div>
  );
}
