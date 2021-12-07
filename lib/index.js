"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _SomfyRtsRemoteAccessory = _interopRequireDefault(require("./SomfyRtsRemoteAccessory.js"));

module.exports = function (api) {
  api.registerAccessory('Somfy Blinds', _SomfyRtsRemoteAccessory["default"]);
};