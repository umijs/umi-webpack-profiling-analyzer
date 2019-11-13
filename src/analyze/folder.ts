
import {getModulePathParts} from '../utils';
import { Module } from './module';
import { ModuleData, ModuleProfiling } from '../ProfilingAnalyzer';
import { TimeRange } from './timeRange';

export class Folder {
  public children: {} = {};

  public getChild(folderName: string): Folder {
    return this.children[folderName];
  }

  public addChildModule(module: Module) {
    const { name } = module;
    const currentChildren = this.children[name];

    if (currentChildren && currentChildren instanceof Folder) return;

    if (currentChildren) {
      currentChildren.merge(module);
    } else {
      // module.parent = this;
      this.children[name] = module;
    }
  }

  public addChildFolder(folderName) {
    this.children[folderName] = new Folder();
    return this.children[folderName];
  }

  public addModule(moduleData: ModuleData, path?: string) {
    const parts = getModulePathParts(path);
    if (!parts || !parts.length) {
      return this.addChildModule(new Module('/', moduleData));
    }
    const [folders, fileName] = [parts.slice(0, -1), parts[parts.length - 1]];

    let currentFolder: Folder = this;
    folders.forEach(folderName => {
      let childNode = currentFolder.getChild(folderName);

      if (!childNode || !(childNode instanceof Folder)) {
        childNode = currentFolder.addChildFolder(folderName);
      }

      currentFolder = childNode;
    });
    const module = new Module(fileName, moduleData);
    currentFolder.addChildModule(module);
  }
}

export function getContextTime(context: ModuleProfiling) {
  const root = new TimeRange();

  for (const key in context) {
    const current = context[key];
    root.add(current.start, current.end);
  }

  return root.sum();
}

export function dfs(
  tree: Folder,
  iterator: (m: Module) => void,
) {
  // 深度遍历
  const { children = {} } = tree;
  for (const key in children) {
    const child = children[key];
    if (child instanceof Module || (child.data && child.name)) {
      iterator(child);
    } else {
      dfs(child, iterator);
    }
  }
}

export function getFolderTime(folder: Folder): number {
  const root = new TimeRange();

  dfs(folder, m => {
    m.ranges.forEach(([start, end]) => {
      root.add(start, end);
    });
  });

  return root.sum();
}

export interface FolderStats {
  path: string;
  timeConsume: number;
}

export function statsFolder(folder: Folder): FolderStats[] {
  const { children = {} } = folder;
  return Object.keys(children).map(key => {
    const child = children[key];
    if (child instanceof Module) {
      return { path: key, timeConsume: child.sum() };
    }
    return { path: key, timeConsume: getFolderTime(child) }
  });
}

export function moduleDataToFolderStats(moduleData: { [key: string]: ModuleData }): FolderStats[] {
  return Object.keys(moduleData).map(path => ({
    path,
    timeConsume: moduleData[path].timeConsume,
  }));
}
