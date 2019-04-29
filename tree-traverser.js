const _ = require("lodash");

module.exports = {
  getPathsToRoot  
}

function getPathsToRoot(componentName, components) {
  const allPaths = [];
  const path = getPathToRoot(componentName, components, [], allPaths);
  if (path) {
    allPaths.push(path);
  }
  
  return allPaths;
}

function getPathToRoot(componentName, components, currentPath = [], allPaths = []) {
    if (currentPath.includes(componentName)) {
      // handle circular dependency
      return;
    }
  
    const component = components[componentName];
    const path = [...currentPath, componentName];
    
    if (_.isEmpty(component.parents)) {
      return path;
    }
    
    for (const parentName of component.parents) {
      const fullPath = getPathToRoot(parentName, components, path, allPaths);
      if (fullPath) {
        // found a path that ends, save it
        allPaths.push(fullPath);
      }
    }
    
    return;
}