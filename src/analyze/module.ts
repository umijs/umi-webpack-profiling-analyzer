import { ModuleData } from '../ProfilingAnalyzer';
import { TimeRange } from './timeRange';

export class Module {
  public parent;
  public name: string;
  public ranges: number[][];

  public constructor(name: string, data: ModuleData) {
    this.name = name;
    this.ranges = [];
    this.mergeData(data)
  }

  public merge(other: Module) {
    this.ranges = this.ranges.concat(other.ranges);
  }

  public mergeData(data: ModuleData) {
    this.ranges.push([data.start, data.end]);
  }

  public sum() {
    const timeRange = new TimeRange();
    this.ranges.forEach(([start, end ]) => {
      timeRange.add(start, end);
    });
    return timeRange.sum();
  }

}
