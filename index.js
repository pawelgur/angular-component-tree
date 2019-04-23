const parse5 = require('parse5');
const fs = require('fs');
const glob = require("glob")
const path = require('path');
const _ = require("lodash");

const htmlTags = require('html-tags');
const customTags = ["#text", "#comment", "ng-container", "ng-template"];
const tagsToSkip = [...customTags, ...htmlTags];

const NO_DUPLICATES = true; // will report max 1 instance of each component

glob("./sources/**/*.html", {}, (er, files) => {
	for (let file of files) {
		let contents = fs.readFileSync(file, 'utf8');
		let document = parse5.parseFragment(contents);
		let filename = path.basename(file);
    
    let node = transformDocument(document, filename);
        
    printBranch(node);
		console.log("");
	}
});

function transformDocument(document, filename) {
  let existingNodes = [];
  let nodes = transformNode(document, existingNodes);
  let rootNode = nodes[0];
  rootNode.name = filename;
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

function hasChildren(node) {
  return isIterable(node.childNodes) && node.childNodes && node.childNodes.length;
}

function isIgnored(node) {
  return tagsToSkip.includes(node.nodeName);
}

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function printTree(nodes) {
  for (let node of nodes) {
    printBranch(node);
  }  
}

function printBranch(node, separator = "") {
  console.log(`${separator} ${node.name}`);
  
  for (let child of node.children) {
    printBranch(child, separator + "-");
  }
}

function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}