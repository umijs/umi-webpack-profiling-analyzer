
import {getModulePathParts} from '../utils';

export class Folder {
  children: {};

  getChild(folderName: string): Folder {
    return this.children[folderName];
  }

  addChildFolder(folderName) {
    this.children[folderName] = new Folder();
    return this.children[folderName];
  }

  addModule(path, data) {
    const parts = getModulePathParts(path);
    if (!parts || !parts.length) {
      return;
    }
    const [folders, filename] = [parts.slice(0, -1), parts[parts.length - 1]];

    let currentFolder: Folder = this;
    folders.forEach(folderName => {
      let childNode = currentFolder.getChild(folderName);

      if (!childNode || !(childNode instanceof Folder)) {
        childNode = currentFolder.addChildFolder(folderName);
      }

      currentFolder = childNode;
    });
    console.log('>> parts', folders, filename);
  }
}
