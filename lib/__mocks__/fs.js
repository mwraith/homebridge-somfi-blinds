"use strict";

var fs = jest.createMockFromModule("fs");
/**
 * Mocking of writing a file to disk
 * 
 * @param {String} path 
 * @param {String} content 
 */

function writeFileSync(path, content) {
  this.savedData[path] = content;
}
/**
 * Retrieves file content of file written by a mock
 * 
 * @param {String} path 
 * @returns String
 */


function readFileSync(path) {
  return this.savedData[path];
}
/**
 * Mocks fs.exists based on whether mock has already written to file
 * @param {*} path 
 * @returns 
 */


function existsSync(path) {
  return path in this.savedData;
} // Setup mock methods


fs.readFileSync = readFileSync;
fs.writeFileSync = writeFileSync;
fs.existsSync = existsSync;
fs.savedData = {};
module.exports = fs;