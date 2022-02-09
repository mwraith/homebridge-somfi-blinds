"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendCommand = sendCommand;

var RpiGpioRts = _interopRequireWildcard(require("./RpiGpioRts.js"));

var BlindState = _interopRequireWildcard(require("./BlindState.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Sends a button press command to RpiGpioRts but also maintains the
 * rolling code within the BlindState.
 * 
 * @param {Object} config Homebridge config
 * @param {String} button Button to press (Up/Down/My/Prog)
 */
function sendCommand(config, button) {
  // Get current rolling code
  var rollingCode = BlindState.getRollingCode(config.id); // Number of repetitions to send. Sending multiple times can improve
  // the reception. But equally sending too many can also be picked up
  // as a 'long press' which causes the blind to only move one step.

  var repetitions = config.repetitions || 4; // Emit command

  console.log("".concat(config.id, ", ").concat(RpiGpioRts.BUTTON[button], ", ").concat(rollingCode));
  RpiGpioRts.sendCommand(config.id, RpiGpioRts.BUTTON[button], rollingCode, repetitions); // Advance the rolling code

  BlindState.advanceRollingCode(config.id);
}