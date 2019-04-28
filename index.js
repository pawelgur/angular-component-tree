const _ = require("lodash");
const argv = require('minimist')(process.argv.slice(2));

const utils = require("./utils.js");
const resolver = require("./component-resolver.js");

const templateSelector = argv.p ? argv.p : "./sources/**/*.html";
const componentName = argv.c;
const isDebug = argv.d;

/*
  TODO:
  1. show part of graph where component is placed (up to root node, but without details of siblings; also show child graph)

  - scan for ts files and detect components, parse `templateUrl` or `template` to get template
  - support multiple selector names, directives
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
  const dependencies = component && component.dependencies;
  const parents = resolver.resolveParentComponents(componentName, components);

  console.log(componentName);
  if (dependencies) {
    console.log("Uses:");
    prettyJSON(component.dependencies);  
  } else {
    console.log("Failed to resolve dependencies: component not found");
  }
  

  console.log("");
  console.log("Used in:");
  prettyJSON(parents);
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
  for (const childKey of component.dependencies) {
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
  for (let dep of info.dependencies) {
    console.log("-", dep);
  }
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

function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}
