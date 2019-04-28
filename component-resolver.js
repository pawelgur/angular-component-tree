const parse5 = require('parse5');
const fs = require('fs');
const glob = require("glob")
const path = require('path');
const _ = require("lodash");

const utils = require("./utils.js");

module.exports = {
    resolveComponents,
    resolveParentComponents
};

function resolveComponents(templateSelector) {  
  const components = {};
  
  const files = glob.sync(templateSelector);
  for (let file of files) {
    let contents = fs.readFileSync(file, 'utf8');
    let document = parse5.parseFragment(contents);  
    let info = getComponentInfo(document, file);
    
    components[info.name] = info;
  }

  return components;
}

function resolveParentComponents(componentName, components) {
  const parents = [];
  _.forEach(components, component => {
    if (component.name !== componentName && component.dependencies.includes(componentName)) {
      parents.push(component.name);
    }
  });
  
  return parents;
}

function getComponentInfo(templateDocument, templateFile) {
  const componentFile = getComponentFile(templateFile);  
  const name = getComponentName(componentFile);
  
  return {
    name,
    componentPath: componentFile,
    templatePath: templateFile,
    dependencies: findDependencies(templateDocument, [], name)    
  };
}

function findDependencies(node, dependencies, rootNodeName) {
  if (!utils.isIgnored(node) && !dependencies.includes(node.nodeName)) {
    dependencies.push(node.nodeName);
  }
  
  if (node.nodeName === rootNodeName) {
    // handle circular dependencies
    return dependencies;
  }
  
  if (utils.hasChildren(node)) {
    for (let child of node.childNodes) {
      findDependencies(child, dependencies, rootNodeName);
    }
  }
  
  return dependencies;
}

function getComponentFile(templateFile) {
  let tsFile = templateFile.replace(".html", ".ts");
  if (!fs.existsSync(tsFile)) {
    console.warn("WARNING: ts file not found!", tsFile);
    return
  }
  
  return tsFile;
}

function getComponentName(componentFile) {
  let contents = fs.readFileSync(componentFile, 'utf8');
  
  let re = /@Component\(\{(.+?)\}\)/gms;
  let match = re.exec(contents);
  if (noMatch(match)) {
    return;
  }
  
  re = /selector:\s"(.+?)"/gms;
  match = re.exec(match[1]);
  if (noMatch(match)) {
    return;
  }
  
  return match[1];  
  
  function noMatch(match) {
    if (!match || match.length < 2) {
      console.warn("WARNING: component name not found!", tsFile);
      return true;
    }
    
    return false;
  }
}

