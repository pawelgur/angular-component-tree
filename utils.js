const htmlTags = require('html-tags');
const customTags = ["#text", "#comment", "#document-fragment", "ng-container", "ng-template"];
const tagsToSkip = [...customTags, ...htmlTags];

module.exports = {
  hasChildren, 
  isIgnored,
  isIterable,
  prettyJSON
};

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

function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}
