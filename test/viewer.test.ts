import { expect } from 'chai';
const data = require('./stats/test.json');
import { generateClientData } from '../src/viewer';

describe('should viewer work', () => {
  it('should generateClientData', () => {
    const result = generateClientData(data);
    expect(result);
  });
});
