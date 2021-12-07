"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.advanceRollingCode = advanceRollingCode;
exports.getOn = getOn;
exports.getRollingCode = getRollingCode;
exports.setOn = setOn;

var fs = _interopRequireWildcard(require("fs"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Private helper function used to get the state from file
 * @param {String} id - Id of blind
 * @returns {Object} structured objected containing blind data
 */
function readStateFromFile(id) {
  var filename = "./".concat(id, ".json");
  var state;

  if (!fs.existsSync(filename)) {
    // Return initial state 
    state = {
      "on": true,
      "rollingCode": 1
    };
  } else {
    state = JSON.parse(fs.readFileSync(filename));

    if (isNaN(parseInt(state.rollingCode))) {
      throw "No valid rolling code in file ./".concat(this.id, ".txt");
    }
  }

  return state;
}
/**
 * Private helper function used to set the state in file
 * @param {String} id - Id of blind
 * @returns {Object} structured objected containing blind data
 */


function writeStateToFile(id, state) {
  var filename = "./".concat(id, ".json");
  var toWrite = JSON.stringify(state, null, 4);
  fs.writeFileSync(filename, toWrite, function (err) {
    if (err) throw err;
  });
}
/**
 * Handle requests to get the current value of the "On" characteristic
 * @method getOn
 * @param {String} id - Id of blind
 * @returns {Boolean} - true = blind closed; false = blind open
 */


function getOn(id) {
  var state = readStateFromFile(id);
  return state.on;
}
/**
 * Set the current value of the "On" characteristic
 * @method setOn
 * @param {String} id - Id of blind
 * @param {String} value - Value to set
 * @returns {Boolean} - true = blind closed; false = blind open
 */


function setOn(id, value) {
  var state = readStateFromFile(id); // Update value

  state["on"] = value;
  writeStateToFile(id, state);
}
/**
 * Handle requests to get the current value of the "On" characteristic
 * @method getRollingCode
 * @param {String} id - Id of blind
 * @returns {Integer} - Value of the current rolling code
 */


function getRollingCode(id) {
  var state = readStateFromFile(id);
  return state.rollingCode;
}
/**
 * Set the current value of the "On" characteristic
 * @method advanceRollingCode
 * @param {String} id - Id of blind
 * @returns {Integer} - Value of the new rolling code
 */


function advanceRollingCode(id) {
  var state = readStateFromFile(id); // Advance code

  state.rollingCode++; // Write to file

  writeStateToFile(id, state);
  return state.rollingCode;
}