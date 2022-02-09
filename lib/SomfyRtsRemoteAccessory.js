"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _ButtonAccessory = _interopRequireDefault(require("./ButtonAccessory.js"));

var _WindowCoveringAccessory = _interopRequireDefault(require("./WindowCoveringAccessory.js"));

var _types = require("@babel/types");

/**
 * Class simulating a Somfy RTS Remote Accessory for Homebridge
 * with a simple stateful on/off switch
 *
 * @class SomfyRtsRemoteAccessory
 */
var SomfyRtsRemoteAccessory = /*#__PURE__*/function () {
  /**
   * Constructor of the class SomfyRtsRemoteAccessory
   *
   * @constructor
   * @param {Object} log - The Homebridge log
   * @param {Object} config - The Homebridge config data filtered for this item
   * @param {Object} api - The Homebridge api
   */
  function SomfyRtsRemoteAccessory(log, config, api) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, SomfyRtsRemoteAccessory);
    // Switch services that will be exposed
    this.switchServices = []; // If we are in admin mode then we display everything as stateless switches
    // that model button presses.

    if (config.adminMode) {
      var buttons = ['Up', 'Down', 'My', 'Prog'];
      buttons.forEach(function (button) {
        var buttonName = "".concat(config.name, " ").concat(button); // Register a button service

        _this.switchServices.push(new _ButtonAccessory["default"](buttonName, button, log, config, api));
      });
    } // Also show the stateful accessory that represents the blind.


    this.switchServices.push(new _WindowCoveringAccessory["default"](config.name, log, config, api)); // Log

    log.debug("Initialized accessory ".concat(config.name));
  }
  /**
   * Mandatory method for Homebridge
   * Return a list of services provided by this accessory
   *
   * @method getServices
   * @return {Array} - An array containing the services
  */


  (0, _createClass2["default"])(SomfyRtsRemoteAccessory, [{
    key: "getServices",
    value: function getServices() {
      return this.switchServices;
    }
  }]);
  return SomfyRtsRemoteAccessory;
}();

exports["default"] = SomfyRtsRemoteAccessory;