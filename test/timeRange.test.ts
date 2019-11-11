import { TimeRange } from '../src/analyze/timeRange';
import { expect } from 'chai';

function shouldEquals(timeRange, arr) {
  expect(timeRange.toArray()).to.deep.equal(arr);
};

describe('should timeRange work', () => {
  let timeRange;
  it('should init time range', () => {
    timeRange = new TimeRange();
    timeRange.add(15, 20);
    expect(timeRange);
    shouldEquals(timeRange, [[15, 20]]);
  });

  it('should insert before', () => {
    timeRange.add(5, 10);
    shouldEquals(timeRange, [[5, 10], [15, 20]]);
  });

  it('should insert after', () => {
    timeRange.add(25, 30);
    shouldEquals(timeRange, [[5, 10], [15, 20], [25, 30]]);
  });


  it('should insert across first node', () => {
    timeRange.add(4, 8);
    shouldEquals(timeRange, [[4, 10], [15, 20], [25, 30]]);
  });

  it('should insert cover first node', () => {
    timeRange.add(2, 12);
    shouldEquals(timeRange, [[2, 12], [15, 20], [25, 30]]);
  });

  it('should insert cover last node', () => {
    timeRange.add(26, 35);
    shouldEquals(timeRange, [[2, 12], [15, 20], [25, 35]]);
  });

  it('should insert between two nodes', () => {
    timeRange.add(13, 14);
    shouldEquals(timeRange, [[2, 12], [13, 14], [15, 20], [25, 35]]);
  });

  it('should insert cover multi nodes', () => {
    timeRange.add(1, 24);
    shouldEquals(timeRange, [[1, 24], [25, 35]]);
  });

  it('should insert across two nodes', () => {
    timeRange.add(10, 26);
    shouldEquals(timeRange, [[1, 35]]);
  });

  it('should insert across last nodes', () => {
    timeRange.add(25, 40);
    shouldEquals(timeRange, [[1, 40]]);
  });

  it('should insert across all nodes', () => {
    timeRange.add(0, 50);
    shouldEquals(timeRange, [[0, 50]]);
  });

  it('edge cases', () => {
    timeRange.add(50, 50);
    shouldEquals(timeRange, [[0, 50]]);

    timeRange.add(50, 60);
    shouldEquals(timeRange, [[0, 60]]);

    timeRange.add(70, 80);
    shouldEquals(timeRange, [[0, 60], [70, 80]]);

    timeRange.add(60, 70);
    shouldEquals(timeRange, [[0, 80]]);
  });

  it('should calc context time', () => {
    const t = new TimeRange();
    const data = [
      [
        1573455350792,
        1573455350856
      ],
      [
        1573455350504,
        1573455350586
      ],
      [
        1573455515001,
        1573455515031
      ],
      [
        1573455350634,
        1573455350675
      ],
      [
        1573455501165,
        1573455501239
      ],
      [
        1573455350634,
        1573455350734
      ],
      [
        1573455350788,
        1573455350812
      ],
      [
        1573455350791,
        1573455350867
      ],
      [
        1573455350791,
        1573455350829
      ],
      [
        1573455350792,
        1573455350845
      ],
      [
        1573455350792,
        1573455350926
      ],
      [
        1573455350792,
        1573455350856
      ],
      [
        1573455350982,
        1573455351114
      ]
    ];
    data.forEach(([start, end]) => {
      t.add(start, end);
    });
    expect(t.sum()).to.equal(556);
  });
});

