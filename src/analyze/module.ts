import { ModuleData } from '../ProfilingAnalyzer';

export class Module {
  public parent;
  public constructor(public name: string, public data: ModuleData) {}

  public mergeData(data: ModuleData) {
    this.data.start = data.start;
    this.data.end = data.end;
    this.data.timeConsume = this.data.end - this.data.start;
  }
}
