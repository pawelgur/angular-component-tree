const argv = require('minimist')(process.argv.slice(2));

const utils = require("./utils.js");
const traverser = require("./tree-traverser.js");

const componentName = argv.c || "d";

const testData = {
  "a": {
    name: "a",
    parents: [],
    children: ["b", "e", "f"]
  },
  "b": {
    name: "b",
    parents: ["a", "i"],
    children: ["c", "d"]
  },
  "c": {
    name: "c",
    parents: ["b", "c"],
    children: []
  },
  "d": {
    name: "d",
    parents: ["b", "e", "j"],
    children: []
  },
  "e": {
    name: "e",
    parents: ["a", "f"],
    children: ["d"]
  },
  "f": {
    name: "f",
    parents: ["a"],
    children: ["e", "j"]
  },
  "j": {
    name: "j",
    parents: ["f"],
    children: ["d"]
  },
  "i": {
    name: "i",
    parents: ["a"],
    children: ["b"]
  }
};

const paths = traverser.getPathsToRoot(componentName, testData);
console.log(`Paths from ${componentName} to root:`);
utils.prettyJSON(paths);
