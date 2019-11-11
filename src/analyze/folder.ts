
import {getModulePathParts} from '../utils';
import { Module } from './module';
import { ModuleData, ModuleProfiling } from '../ProfilingAnalyzer';
import { TimeRange } from './timeRange';

export class Folder {
  children: {} = {};

  getChild(folderName: string): Folder {
    return this.children[folderName];
  }

  addChildModule(module: Module) {
    const { name } = module;
    const currentChildren = this.children[name];

    if (currentChildren && currentChildren instanceof Folder) return;

    if (currentChildren) {
      currentChildren.mergeData(module.data);
    } else {
      // module.parent = this;
      this.children[name] = module;
    }
  }

  addChildFolder(folderName) {
    this.children[folderName] = new Folder();
    return this.children[folderName];
  }

  addModule(moduleData: ModuleData, path?: string) {
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
    root.add(m.data.start, m.data.end);
  });

  return root.sum();
}

export function statsFolder(folder: Folder): { path: string; timeConsume: number }[] {
  const { children = {} } = folder;
  return Object.keys(children).map(key => {
    const child = children[key];
    if (child instanceof Module) {
      return { path: key, timeConsume: child.data.end - child.data.start };
    }
    return { path: key, timeConsume: getFolderTime(child) }
  });
}

