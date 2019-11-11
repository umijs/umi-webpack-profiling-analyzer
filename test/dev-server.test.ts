import {exec} from 'child_process';

const ROOT = `${__dirname}/dev-server`;
const WEBPACK_CONFIG_PATH = `${ROOT}/webpack.config.js`;
// const webpackConfig = require(WEBPACK_CONFIG_PATH);

describe('Webpack Dev Server', function () {
  it('should start dev server', function (done) {
    const timeout = 15000;
    this.timeout(timeout);

    const devServer = exec(`${__dirname}/../node_modules/.bin/webpack-dev-server --config ${WEBPACK_CONFIG_PATH}`, {
      cwd: ROOT
    });

    const checkTimeout = setTimeout(() => {
      clearTimeout(checkTimeout);
      devServer.kill();
      done();
    }, 300);

  });
});
