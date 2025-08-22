"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _SomfyRtsRemoteAccessory = _interopRequireDefault(require("./SomfyRtsRemoteAccessory.js"));

var _SomfyRtsPlatform = require("./SomfyRtsPlatform.js");

module.exports = function (api) {
  // Old approach for registering accessories directly
  api.registerAccessory('homebridge-somfi-blinds', 'Somfy Blinds', _SomfyRtsRemoteAccessory["default"]); // New approach for registering platforms (supporting child bridges)

  api.registerPlatform('homebridge-somfi-blinds', 'Somfy Blinds Platform', _SomfyRtsPlatform.SomfyRtsPlatform);
};