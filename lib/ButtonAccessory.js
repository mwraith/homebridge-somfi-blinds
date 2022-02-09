"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _SendCommand = require("./SendCommand.js");

// Helper class used to send the commands to RpiGpioRts whilst maintaining
// the rolling code correctly.

/**
 * Creates a new stateless button. We are using the 'Switch'
 * service in Apple HomeKit since there is no such Button accessory.
 * 
 * This accessory is only used for the 'UP', 'DOWN', 'PROG', 'MY'
 * buttons that are shown when in Admin Mode. The switch works in such
 * a way that user turns to On position when they want to press the button
 * and after a short delay the Switch automatically turns itself
 * back to Off position.
 * 
 * For the main accessory that resembles the Blind itseld refer to the
 * WindowCoveringAccessory class.
 */
var ButtonAccessory = /*#__PURE__*/function () {
  /**
   * Constructor for a a new stateless button. Used for the 'UP', 'DOWN', 'PROG', 'MY'
   * buttons that are shown when in Admin Mode.
   * 
   * @param {String} name    Label for the button
   * @param {String} button  Up/Down/My/Prog
   * @param {Object} log     Homebridge log object
   * @param {Object} config  Homebridge config object
   * @param {Object} api     Homebridge api object
   * @returns {api.hap.Service}  Homebridge Service
   */
  function ButtonAccessory(name, button, log, config, api) {
    (0, _classCallCheck2["default"])(this, ButtonAccessory);
    this.name = name;
    this.button = button;
    this.log = log;
    this.config = config;
    this.api = api; // Delay to reset the switch after being pressed

    this.delay = 1000; // Set current state of button to false

    this.state = false; // Register a switch service

    this.service = new this.api.hap.Service.Switch(name, button); // Bind functions to manage events

    this.service.getCharacteristic(this.api.hap.Characteristic.On).onGet(this.getButtonOn.bind(this)).onSet(this.setButtonOn.bind(this));
    return this.service;
  }
  /**
   * Getter for the 'On' characteristic of the button just returns from the 
      * internal state.
   *
   * @method getOn
  */


  (0, _createClass2["default"])(ButtonAccessory, [{
    key: "getButtonOn",
    value: function () {
      var _getButtonOn = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.log.debug("Get '".concat(this.button, "' for ").concat(this.config.id, " - ").concat(this.state)); // Use the internal array that contains the position

                return _context.abrupt("return", this.state);

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getButtonOn() {
        return _getButtonOn.apply(this, arguments);
      }

      return getButtonOn;
    }()
    /**
     * Setter for the 'On' characteristic, sets the internal state and creates
        * a timer that after a delay changes the button to off again. This models
        * the behaviour of the button represented with a switch.
     *
     * @method setOn
     * @param {Object} value - The value for the characteristic
    */

  }, {
    key: "setButtonOn",
    value: function () {
      var _setButtonOn = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(value) {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.log.debug("Function setOn called for button ".concat(this.button, " with value ").concat(value)); // Send button press to RpiGpioRts

                (0, _SendCommand.sendCommand)(this.config, this.button); // Update current state to on

                this.state = value; // After a few seconds switch the state back off again

                if (value === true) {
                  this.resetSwitchWithTimeout();
                }

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function setButtonOn(_x) {
        return _setButtonOn.apply(this, arguments);
      }

      return setButtonOn;
    }()
    /**
     * Reset the switch to false to simulate a stateless behavior
     *
     * @method resetSwitchWithTimeout
    */

  }, {
    key: "resetSwitchWithTimeout",
    value: function resetSwitchWithTimeout() {
      this.log.debug("Function resetSwitchWithTimeout called for button ".concat(this.button));
      setTimeout(function () {
        this.log.debug("Auto switching button ".concat(this.button));
        this.state = false;
        this.service.updateCharacteristic(this.api.hap.Characteristic.On, false);
      }.bind(this), this.delay);
    }
  }]);
  return ButtonAccessory;
}();

exports["default"] = ButtonAccessory;