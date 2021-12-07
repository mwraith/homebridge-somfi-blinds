"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var BlindState = _interopRequireWildcard(require("./BlindState.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

//const RpiGpioRts = require('./RpiGpioRts');

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
    this.log = log;
    this.config = config;
    this.api = api; //this.emitter = new RpiGpioRts(log, config);

    var Service = this.api.hap.Service;
    var Characteristic = this.api.hap.Characteristic; // Delay to reset the switch after being pressed

    this.delay = 1000; // Decide what buttons the user should get

    var buttons = this.config.adminMode ? ['Toggle', 'Up', 'Down', 'My', 'Prog'] : ['Toggle']; // Create Switches

    this.switchServices = {};
    buttons.forEach(function (button) {
      var buttonName = button == 'Toggle' ? _this.config.name : "".concat(_this.config.name, " ").concat(button);
      var service = new Service.Switch(buttonName, button); // Bind functions to manage events

      service.getCharacteristic(Characteristic.On).onGet(_this.getOn.bind(_this, button)).onSet(_this.setOn.bind(_this, button));
      _this.switchServices[button] = service;
    }); // Set default states to off

    this.states = Object.fromEntries(buttons.map(function (button) {
      return [button, false];
    })); // Log success

    this.log.debug("Initialized accessory ".concat(this.config.name));
  }
  /**
   * Getter for the 'On' characteristic of the 'Switch' service
   *
   * @method getOn
   * @param {String} button - 'Toggle', 'Up', 'Down', 'My', 'Prog'
  */


  (0, _createClass2["default"])(SomfyRtsRemoteAccessory, [{
    key: "getOn",
    value: function () {
      var _getOn = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(button) {
        var state;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(button == 'Toggle')) {
                  _context.next = 6;
                  break;
                }

                // For the toggle button let's read the state from a file
                state = BlindState.getOn(this.config.id);
                this.log.debug("Get 'Toggle' for ".concat(this.config.id, " - ").concat(state));
                return _context.abrupt("return", state);

              case 6:
                this.log.debug("Get '".concat(button, "' for ").concat(this.config.id, " - ").concat(this.states[button])); // For other buttons we use the internal array

                return _context.abrupt("return", this.states[button]);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getOn(_x) {
        return _getOn.apply(this, arguments);
      }

      return getOn;
    }()
    /**
     * Setter for the 'On' characteristic of the 'Switch' service
     *
     * @method setOn
     * @param {String} button - 'Toggle', 'Up', 'Down', 'My', 'Prog'
     * @param {Object} value - The value for the characteristic
    */

  }, {
    key: "setOn",
    value: function () {
      var _setOn = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(button, value) {
        var state, stringifyState;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.log.debug("Function setOn called for button ".concat(button, " with value ").concat(value));

                if (button == 'Toggle') {
                  // For the Toggle button we persist the change to the file
                  state = BlindState.setOn(this.config.id, value); // Log

                  stringifyState = JSON.stringify(state);
                  this.log.debug("Triggered SET for ".concat(this.config.id, " - ").concat(stringifyState));
                } else {
                  // For other buttons we change the internal state and set a timer to change it back
                  // in X ms
                  this.states[button] = value;

                  if (value === true) {
                    this.resetSwitchWithTimeout(button);
                  }
                }

                this.sendCommand(button);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function setOn(_x2, _x3) {
        return _setOn.apply(this, arguments);
      }

      return setOn;
    }()
    /**
     * Reset the switch to false to simulate a stateless behavior
     *
     * @method resetSwitchWithTimeout
     * @param {String} button - 'Up', 'Down', 'My', 'Prog'
    */

  }, {
    key: "resetSwitchWithTimeout",
    value: function resetSwitchWithTimeout(button) {
      this.log.debug("Function resetSwitchWithTimeout called for button ".concat(button));
      setTimeout(function () {
        this.log.debug("Auto switching button ".concat(button));
        this.states[button] = false;
        this.switchServices[button].updateCharacteristic(this.api.hap.Characteristic.On, false);
      }.bind(this), this.delay);
    }
    /**
     * Mandatory method for Homebridge
     * Return a list of services provided by this accessory
     *
     * @method getServices
     * @return {Array} - An array containing the services
    */

  }, {
    key: "getServices",
    value: function getServices() {
      return Object.values(this.switchServices);
    }
    /**
     * Send a command to the device
     */

  }, {
    key: "sendCommand",
    value: function sendCommand(button) {
      // Emit command
      // this.emitter.sendCommand(button);
      // Advance the rolling code
      BlindState.advanceRollingCode(this.config.id);
    }
  }]);
  return SomfyRtsRemoteAccessory;
}();

exports["default"] = SomfyRtsRemoteAccessory;