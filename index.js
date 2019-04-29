const _ = require("lodash");
const argv = require('minimist')(process.argv.slice(2));

const utils = require("./utils.js");
const resolver = require("./component-resolver.js");

const templateSelector = argv.p || "./sources/**/*.html";
const componentName = argv.c;
const isDebug = argv.d;

/*
  TODO:
  1. show part of graph where component is placed (up to root node, but without details of siblings; also show child graph)

  - scan for ts files and detect components, parse `templateUrl` or `template` to get template
  - support multiple selector names, directives
  - handle components not included in the project properly (these are components with parents, but no children), watch out for transclusion (it's not a child)
 */

main();


function main() {
  const components = resolver.resolveComponents(templateSelector);

  if (isDebug) {
    printDebugInfo(components);
    return;  
  }
  
  if (!componentName) {
    printComponentTree(components);
    return;
  }

  const component = components[componentName];
  
  if (!component) {
    const parents = resolver.resolveParentComponents(componentName, components);
    
    console.log(componentName);
    console.log("Note: component file not found");
    console.log("Parent components:");
    utils.prettyJSON(parents);
    
    return;    
  }
  
  printComponentInfo(component);
}


function printDebugInfo(components) {
  _.forEach(components, componentInfo => {
    console.log("");
    printComponentInfo(componentInfo);
    console.log("");  
  });
}

function printComponentTree(components) {
  _.forEach(components, component => {
    printComponent(component, "", components);
    console.log("");
  });
}

function printComponent(component, level = "", components, componentsInBranch = []) {
  console.log(level, component.name);
  
  if (componentsInBranch.includes(component.name)) {
    return;
  }  
  componentsInBranch = [...componentsInBranch, component.name]; // create new branch for this level so it will not affect upper levels
  
  level = level + "-";
  for (const childKey of component.children) {
    const child = components[childKey];
    if (child) {
      printComponent(child, level, components, componentsInBranch);
    } else {
      console.log(level, childKey, "x");
    }
  }  
}


function printComponentInfo(info) {
  console.log(info.name);
  console.log(info.componentPath);
  console.log(info.templatePath);
  console.log("Child components:");
  utils.prettyJSON(info.children)
  console.log("Parent components:");
  utils.prettyJSON(info.parents);
}

// for debugging, prints real html tree
function printOriginalTree(node, separator = "") {
  const skipNodes = ["#text", "#comment", "#document-fragment"];
  
  if (!skipNodes.includes(node.nodeName)) {
    console.log(`${separator} ${node.nodeName}`);  
  }   
   
  if (utils.hasChildren(node)) {
    for (let child of node.childNodes) {
      printOriginalTree(child, separator + "-");
    }
  }  
}