import { expect } from 'chai';
import axios from 'axios';
import { describe, it } from 'mocha';
import { generateClientData, startAnalyzerServer } from '../src/viewer';

const data = require('./stats/test.json');

describe('should viewer work', () => {

  it('should generateClientData', () => {
    const result = generateClientData(data);
    expect(result);
  });

  it('should start analyze server', async () => {
    const result = await startAnalyzerServer(data, { openBrowser: false });
    expect(result.server);

    const resp = await axios.get('http://127.0.0.1:8888');
    expect(resp);
    expect(resp.status).to.eql(200);

    await new Promise(resolve => result.server.close(() => resolve()));
  });

});
