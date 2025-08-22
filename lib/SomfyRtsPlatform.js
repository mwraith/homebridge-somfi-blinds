"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SomfyRtsPlatform = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _SomfyRtsRemoteAccessory = _interopRequireDefault(require("./SomfyRtsRemoteAccessory.js"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Class representing a platform that supports mutiple Somfy RTS devices
 * for Homebridge.
 * 
 * Config (platform mode):
 * {
 *   "platform": "SomfyRtsPlatform",
 *   "name": "Somfy RTS",
 *   "devices": [
 *     { "id": "1234", "name": "Living Room Blind", "adminMode": false }
 *   ]
 * }
 * 
 * @class SomfyRtsPlatform
 */
var SomfyRtsPlatform = /*#__PURE__*/function () {
  /**
   * Constructor of the class SomfyRtsPlatform
   *
   * @constructor
   * @param {Object} log - The Homebridge log
   * @param {Object} config - The Homebridge config data filtered for this item
   * @param {Object} api - The Homebridge api
   */
  function SomfyRtsPlatform(log, config, api) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, SomfyRtsPlatform);
    this.log = log;
    this.config = config || {};
    this.api = api;
    this.accessories = new Map(); // Initialise once loaded

    api.on('didFinishLaunching', function () {
      return _this.discoverAndSync();
    }); // Log

    log.debug("Initialized platform ".concat(config.name));
  }
  /**
   * Called by Homebridge for cached accessories restored on startup.
   * @param {PlatformAccessory} accessory
   */


  (0, _createClass2["default"])(SomfyRtsPlatform, [{
    key: "configureAccessory",
    value: function configureAccessory(accessory) {
      this.accessories.set(accessory.UUID, accessory);
    }
    /**
     * Adds accessories as per the config file
     */

  }, {
    key: "discoverAndSync",
    value: function discoverAndSync() {
      var devices = Array.isArray(this.config.devices) ? this.config.devices : [];
      var seen = new Set();

      var _iterator = _createForOfIteratorHelper(devices),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _dev$id;

          var dev = _step.value;
          // Choose a stable key for UUID generation
          var key = String((_dev$id = dev.id) !== null && _dev$id !== void 0 ? _dev$id : dev.name);
          var uuid = this.api.hap.uuid.generate("somfy-rts:".concat(key));
          seen.add(uuid);
          var acc = this.accessories.get(uuid); // Build Services with the same logic as legacy accessory mode

          var legacy = new _SomfyRtsRemoteAccessory["default"](this.log, dev, this.api);
          var services = legacy.getServices();

          if (!acc) {
            // Not in cache: create a new PlatformAccessory and register it
            acc = new this.api.platformAccessory(dev.name, uuid); // Add all service instances produced by the legacy path

            var _iterator3 = _createForOfIteratorHelper(services),
                _step3;

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var s = _step3.value;
                acc.addService(s);
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }

            this.api.registerPlatformAccessories('Somfy Blinds', 'SomfyRtsPlatform', [acc]);
            this.accessories.set(uuid, acc);
            this.log.info("Registered Somfy device: ".concat(dev.name));
          } else {
            // Cached accessory found: refresh non-info services for config changes
            var _iterator4 = _createForOfIteratorHelper(acc.services),
                _step4;

            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var _s = _step4.value;

                if (_s.displayName !== 'Accessory Information') {
                  acc.removeService(_s);
                }
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }

            var _iterator5 = _createForOfIteratorHelper(services),
                _step5;

            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var _s2 = _step5.value;
                acc.addService(_s2);
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }

            this.log.debug("Updated Somfy device: ".concat(dev.name));
          }
        } // Optional tidy-up: remove accessories no longer present in config

      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var _iterator2 = _createForOfIteratorHelper(this.accessories),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = (0, _slicedToArray2["default"])(_step2.value, 2),
              _uuid = _step2$value[0],
              _acc = _step2$value[1];

          if (!seen.has(_uuid)) {
            this.api.unregisterPlatformAccessories('Somfy Blinds', 'SomfyRtsPlatform', [_acc]);
            this.accessories["delete"](_uuid);
            this.log.info("Unregistered removed device: ".concat(_acc.displayName));
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }]);
  return SomfyRtsPlatform;
}();

exports.SomfyRtsPlatform = SomfyRtsPlatform;