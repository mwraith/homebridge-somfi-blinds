"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _SomfyRtsRemoteAccessory = _interopRequireDefault(require("../SomfyRtsRemoteAccessory.js"));

var BlindState = _interopRequireWildcard(require("../BlindState.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Mock the file system methods
jest.mock('fs'); // Need to mock timers for the admin buttons that switch off after X ms

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
var LOGGING_ON = false; // Mock the Logger for Homebridge

var log = {
  debug: function debug(text) {
    if (LOGGING_ON) console.log(text);
  }
}; // A mock Switch accessory

var SwitchServiceMock = /*#__PURE__*/function () {
  function SwitchServiceMock(buttonName, button) {
    (0, _classCallCheck2["default"])(this, SwitchServiceMock);
    this.buttonName = buttonName;
    this.button = button;
    this.methods = [];
  }

  (0, _createClass2["default"])(SwitchServiceMock, [{
    key: "getCharacteristic",
    value: function getCharacteristic(characteristic) {
      return this;
    }
  }, {
    key: "setCharacteristic",
    value: function setCharacteristic(characteristic, value) {
      return this;
    }
  }, {
    key: "onGet",
    value: function onGet(f) {
      this.getMethod = f;
      return this;
    }
  }, {
    key: "onSet",
    value: function onSet(f) {
      this.setMethod = f;
      return this;
    }
  }, {
    key: "get",
    value: function get() {
      return this.getMethod();
    }
  }, {
    key: "set",
    value: function set(value) {
      return this.setMethod(value);
    }
  }]);
  return SwitchServiceMock;
}(); // Mock the API for Homebridge


var api = {
  "hap": {
    "Characteristic": {
      "On": 1
    },
    "Service": {
      "Switch": SwitchServiceMock
    }
  }
};
describe("Testing Main Class", function () {
  test("check services with admin mode", function () {
    // Config for the accessory
    var config = {
      "id": 99100,
      "name": "test",
      "adminMode": true
    }; // Create the accessory

    var rts = new _SomfyRtsRemoteAccessory["default"](log, config, api);
    var services = rts.getServices(); // Check we have Toggle, Up, Down, My, Prog buttons

    expect(services.length).toEqual(5);
  });
  test("check services with non admin mode", function () {
    // Config for the accessory
    var config = {
      "id": 99101,
      "name": "test",
      "adminMode": false
    }; // Create the accessory

    var rts = new _SomfyRtsRemoteAccessory["default"](log, config, api);
    var services = rts.getServices(); // Check we have Toggle only

    expect(services.length).toEqual(1);
  });
  test("check admin buttons", function () {
    // Config for the accessory
    var config = {
      "id": 99102,
      "name": "test",
      "adminMode": true
    }; // Create the accessory

    var rts = new _SomfyRtsRemoteAccessory["default"](log, config, api);
    var services = rts.getServices(); // Toggle all of the admin buttons

    services.forEach(function (s) {
      if (s.buttonName != 'Toggle') {
        s.set(true);
      }
    }); // Get all of the admin button states. Should be on

    services.forEach(function (s) {
      if (s.button != 'Toggle') {
        s.get().then(function (data) {//expect(data).toEqual(true);
        });
      }
    }); // Fast-forward until all timers have been executed

    jest.runAllTimers();
    if (LOGGING_ON) console.log('Post timer tests'); // Try all of the admin button states again. Should be off

    services.forEach(function (s) {
      if (s.button != 'Toggle') {
        s.get().then(function (data) {//expect(data).toEqual(false);
        });
      }
    });
  });
  test("check toggle button", function () {
    // Config for the accessory
    var config = {
      "id": 99103,
      "name": "test",
      "adminMode": false
    }; // Create the accessory

    var rts = new _SomfyRtsRemoteAccessory["default"](log, config, api);
    var services = rts.getServices(); // Close blind

    services[0].set(true);
    services[0].get().then(function (data) {
      expect(data).toEqual(true);
    }); // Open blind

    services[0].set(false);
    services[0].get().then(function (data) {
      expect(data).toEqual(false);
    }); // Check the rolling code has been advanced by 2

    var code = BlindState.getRollingCode(config.id);
    expect(code).toEqual(3);
  });
});