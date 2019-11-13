import React from 'react';
import Summary from './summary';
import Modules from './modules';
import Loaders from './loaders';

import styles from './style/viewer.less';

export default function Viewer({ data }) {
  console.log('>> data', data);
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
          <Loaders data={data.loaders}/>
        </div>
      </div>
      <Modules data={data}/>
    </div>
  );
}
