
const {getModulePathParts} = require('../utils');

class Folder {
  addModule(path, data) {
    const parts = getModulePathParts(path);
    if (!parts || !parts.length) {
      return;
    }
    const [folders, filename] = [parts.slice(0, -1), parts[parts.length - 1]];

    let currentFolder = this;
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

module.exports = {
  Folder
};
