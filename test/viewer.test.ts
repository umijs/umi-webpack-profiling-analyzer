import { expect } from 'chai';
import { describe, it } from 'mocha';
import data from './stats/test.json';
import { generateClientData } from '../src/viewer';

describe('should viewer work', () => {
  it('should generateClientData', () => {
    const result = generateClientData(data);
    expect(result);
  });
});
