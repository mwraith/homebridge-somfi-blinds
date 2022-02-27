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

var _SendCommand = require("./SendCommand.js");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Used to read the current state of the blind from file storage
// Helper class used to send the commands to RpiGpioRts whilst maintaining
// the rolling code correctly.

/**
 * Accessory resembles the blind itself and extends the WindowCovering
 * service in Apple HomeKit.
 * 
 * Whilst the HomeKit accessory supports partial covering (e.g. 40% open)
 * the Somfy blinds do not as there is no way to retrieve the current
 * position. The accessory therefore uses a Step Value of 100 in the
 * TargetPosition to avoid users being able to set partial positioning.
 * 
 * Although getting the current position isn't possible, the accessory
 * effectively mocks the CurrentPosition and PositionState such that after
 * sending a request to set the target position the accessory 'appears' that
 * it's in moving state for a certain delay.
 * 
 */
var WindowCoveringAccessory = /*#__PURE__*/function () {
  /**
   * Creates a new stateful window covering service.
   * 
   * @param {String} name    Label for the service
   * @param {Object} log     Homebridge log object
   * @param {Object} config  Homebridge config object
   * @param {Object} api     Homebridge api object
   * @returns {api.hap.Service}  Homebridge Service
   */
  function WindowCoveringAccessory(name, log, config, api) {
    (0, _classCallCheck2["default"])(this, WindowCoveringAccessory);
    this.name = name;
    this.log = log;
    this.config = config;
    this.api = api; // Time for the blind to open/close in milliseconds (mocked)

    this.delay = this.config.blindTimeToOpen || 10000; // Register a switch service

    this.service = new this.api.hap.Service.WindowCovering(this.config.name); // Tracks the last state triggered by the user. Used to assist with the
    // mocking of the blind moving up and down.

    this.lastChange = {}; // Current Position

    this.service.getCharacteristic(this.api.hap.Characteristic.CurrentPosition).onGet(this.getCurrentPosition.bind(this)).setProps({
      minValue: 0,
      maxValue: 100,
      minStep: 1
    }); // Position State

    this.service.getCharacteristic(this.api.hap.Characteristic.PositionState).onGet(this.getPositionState.bind(this)); // Target Position

    this.service.getCharacteristic(this.api.hap.Characteristic.TargetPosition).onGet(this.getTargetPosition.bind(this)).onSet(this.setTargetPosition.bind(this)).setProps({
      minValue: 0,
      maxValue: 100,
      minStep: 100
    });
    return this.service;
  }
  /**
   * Returns the current position of the blind. Since partial covering
   * is not supported. It is either 100 (ON) or 1 (OFF)
   *
   * @returns Integer 100 = ON; 1 = OFF
   */


  (0, _createClass2["default"])(WindowCoveringAccessory, [{
    key: "getCurrentPosition",
    value: function () {
      var _getCurrentPosition = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.currentState) {
                  _context.next = 5;
                  break;
                }

                this.log.debug("Getting current position from state: ".concat(this.currentState.currentPosition));
                return _context.abrupt("return", this.currentState.currentPosition);

              case 5:
                this.log.debug("Getting current position from file");
                return _context.abrupt("return", this.getTargetPosition());

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getCurrentPosition() {
        return _getCurrentPosition.apply(this, arguments);
      }

      return getCurrentPosition;
    }()
    /**
     * Sets the target position of the blinds. Converts the position
     * so that 100 = ON and 1 = OFF
     */

  }, {
    key: "setTargetPosition",
    value: function () {
      var _setTargetPosition = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(value) {
        var PositionState, internalState, button;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                PositionState = this.api.hap.Characteristic.PositionState; // If the blind is already moving send MY button and stop signal

                if (!(this.currentState && this.currentState.positionState != PositionState.STOPPED)) {
                  _context2.next = 7;
                  break;
                }

                // Send My button to stop movement
                (0, _SendCommand.sendCommand)(this.config, 'My'); // Update State to STOPPED

                this.currentState.positionState = PositionState.STOPPED; // Change Target State to Current State

                this.currentState.currentPosition = this.currentState.targetPosition; // Stop the interval from executing so that current position remains

                clearInterval(this.interval);
                return _context2.abrupt("return");

              case 7:
                // 0 = CLOSED (state = true)
                // 100 = OPEN (state = false)
                internalState = value > 0 ? false : true; // Work out what button we need to press based on the current position and
                // whether the blinds should open to My Position instead of fully open
                // (e.g. for venetian blinds MY is used to set partial tilt)

                if (this.config.openToMyPosition) {
                  /*
                  	Target State    Invert
                  	true (CLOSED)   false     = Down
                  	true (CLOSED)   true      = Up
                  	false (OPEN)    false     = My
                  	false (OPEN)    true      = My
                  */
                  button = !internalState ? 'My' : this.config.invertToggle ? 'Up' : 'Down';
                } else {
                  /*
                  	Target State    Invert
                  	true (CLOSED)   false     = Down
                  	true (CLOSED)   true      = Up
                  	false (OPEN)    false     = Up
                  	false (OPEN)    true      = Down
                  */
                  button = this.config.invertToggle ^ internalState ? 'Down' : 'Up';
                } // Send button press to RpiGpioRts


                (0, _SendCommand.sendCommand)(this.config, button); // Persist the change to the file

                BlindState.setOn(this.config.id, internalState);
                this.currentState = {
                  'positionState': value > 0 ? PositionState.INCREASING : PositionState.DECREASING,
                  'targetPosition': value,
                  'currentPosition': value > 0 ? 0 : 100
                }; // Advance the current state by 5%. The delay represents the total time
                // to move the blind, so divide by 20 to give the interval frequency.

                this.interval = setInterval(this.advanceCurrentPosition.bind(this), Math.round(this.delay / 20), value == 100 ? 5 : -5); // Log

                this.log.debug("Triggered SET for ".concat(this.config.id, " - ").concat(value));

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function setTargetPosition(_x) {
        return _setTargetPosition.apply(this, arguments);
      }

      return setTargetPosition;
    }()
    /**
     * Advances the position of the blind by a given percentage. Used to mock
     * the current position of the blind.
     * 
     * @param {Integer} increment The percentage to increase the position
     */

  }, {
    key: "advanceCurrentPosition",
    value: function advanceCurrentPosition(increment) {
      var PositionState = this.api.hap.Characteristic.PositionState; // Advance current position

      this.currentState.currentPosition += increment; // Update homebridge of the new position

      this.service.getCharacteristic(this.api.hap.Characteristic.CurrentPosition).updateValue(this.currentState.currentPosition); // Check if the position is now stopped

      if (this.currentState.currentPosition <= 0 || this.currentState.currentPosition >= 100) {
        this.currentState.positionState = PositionState.STOPPED; // Update homebridge that we are now stopped

        this.service.getCharacteristic(PositionState).updateValue(PositionState.STOPPED); // Stop the interval from executing

        clearInterval(this.interval);
      }
    }
    /**
     * Not tracking increasing or decreasing for the moment. Just represent
     * as being stopped
     * 
     * @returns Characteristic.PositionState.STOPPED
     */

  }, {
    key: "getPositionState",
    value: function () {
      var _getPositionState = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var PositionState;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                PositionState = this.api.hap.Characteristic.PositionState;

                if (!this.currentState) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return", this.currentState.positionState);

              case 5:
                return _context3.abrupt("return", PositionState.STOPPED);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getPositionState() {
        return _getPositionState.apply(this, arguments);
      }

      return getPositionState;
    }()
    /**
     * Gets the position for the blind from BlindState.
     *
     * @returns Integer
     */

  }, {
    key: "getTargetPosition",
    value: function () {
      var _getTargetPosition = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        var state;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                // Read the state from a file
                state = BlindState.getOn(this.config.id);
                this.log.debug("Get target position for ".concat(this.config.id, " - ").concat(state, " from file")); // Convert state
                // 0 = CLOSED (state = true)
                // 100 = OPEN (state = false)

                return _context4.abrupt("return", state ? 0 : 100);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getTargetPosition() {
        return _getTargetPosition.apply(this, arguments);
      }

      return getTargetPosition;
    }()
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
  }]);
  return WindowCoveringAccessory;
}();

exports["default"] = WindowCoveringAccessory;