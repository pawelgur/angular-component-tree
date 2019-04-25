const parse5 = require('parse5');
const fs = require('fs');
const glob = require("glob")
const path = require('path');
const _ = require("lodash");

const htmlTags = require('html-tags');
const customTags = ["#text", "#comment", "#document-fragment", "ng-container", "ng-template"];
const tagsToSkip = [...customTags, ...htmlTags];

const NO_DUPLICATES = true; // will report max 1 instance of each component

/*
  TODO:
  1. get dependencies of component X
  2. find where component X is nested

 */

glob("./sources/**/*.html", {}, (er, files) => {
	for (let file of files) {
		let contents = fs.readFileSync(file, 'utf8');
		let document = parse5.parseFragment(contents);	
    
    console.log("");
    console.log("info ///////////////");
    console.log("");
    let info = getComponentInfo(document, file);
    printComponentInfo(info);
    console.log("");
    
    console.log("original ///////////////");
    printOriginalTree(document);
    console.log("");   
   
	}
});

function getComponentInfo(templateDocument, file) {
  const name = getComponentName(file);
  
  return {
    name,
    path: file,
    dependencies: findDependencies(templateDocument, [], name)    
  };
}

function findDependencies(node, dependencies, rootNodeName) {
  if (!isIgnored(node) && !dependencies.includes(node.nodeName)) {
    dependencies.push(node.nodeName);
  }
  
  if (node.nodeName === rootNodeName) {
    // handle circular dependencies
    return dependencies;
  }
  
  if (hasChildren(node)) {
    for (let child of node.childNodes) {
      findDependencies(child, dependencies, rootNodeName);
    }
  }
  
  return dependencies;
}

function printComponentInfo(info) {
  console.log(info.name);
  console.log(info.path);
  for (let dep of info.dependencies) {
    console.log("-", dep);
  }
}

/*
function transformDocument(document, file) {
  let existingNodes = [];
  let nodes = transformNode(document, existingNodes);
  let rootNode = nodes[0];
  rootNode.name = getComponentName(file);
  rootNode.path = file;
  return rootNode;
}

function transformNode(node, existingNodes) {  
  let children = [];
  if (hasChildren(node)) {
    for (let child of node.childNodes) {
      let childNodes = transformNode(child, existingNodes);
      children = children.concat(childNodes);
    }
  }  
  
  if (isIgnored(node)) {
    return children;
  }
  
  if (NO_DUPLICATES && existingNodes.includes(node.nodeName)) {
    return children;
  }
  
  existingNodes.push(node.nodeName);
  return [{
    name: node.nodeName,
    children
  }];
}

function printTransformedTree(node, separator = "") {
  if (_.isArray(node)) {
    for (let n of node.children) {
      printTransformedTree(n, separator + "-");
    }
    return;
  }
  
  console.log(`${separator} ${node.name}`);
  
  for (let child of node.children) {
    printTransformedTree(child, separator + "-");
  }
}
*/

function hasChildren(node) {
  return isIterable(node.childNodes) && node.childNodes && node.childNodes.length;
}

function isIgnored(node) {
  return tagsToSkip.includes(node.nodeName);
}

function isIterable(obj) {
  if (obj === null || obj === undefined) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

// for debugging, prints real html tree
function printOriginalTree(node, separator = "") {
  const skipNodes = ["#text", "#comment", "#document-fragment"];
  
  if (!skipNodes.includes(node.nodeName)) {
    console.log(`${separator} ${node.nodeName}`);  
  }
   
   
  if (hasChildren(node)) {
    for (let child of node.childNodes) {
      printOriginalTree(child, separator + "-");
    }
  }  
}

function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function getComponentName(file) {
  let tsFile = file.replace(".html", ".ts");
  if (!fs.existsSync(tsFile)) {
    console.warn("WARNING: ts file not found!", tsFile);
    return
  }
  
  let re = /@Component\(\{(.+?)\}\)/gms;
  let contents = fs.readFileSync(tsFile, 'utf8');
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