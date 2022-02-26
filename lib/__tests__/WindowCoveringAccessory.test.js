"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

var _WindowCoveringAccessory = _interopRequireDefault(require("../WindowCoveringAccessory.js"));

var _homebridge = require("homebridge");

var SendCommandMethods = _interopRequireWildcard(require("../SendCommand.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Mock the file system methods
jest.mock('fs'); // Mock the PiGpio methods

jest.mock('pigpio'); // Mock homebridge api & logger

jest.mock('homebridge'); // Need to mock timers for the admin buttons that switch off after X ms

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
describe("Testing Window Covering Accessory", function () {
  test("Check Window Covering Initialisation", function () {
    // Config for the accessory
    var config = {
      "id": 99201,
      "name": "Test",
      "adminMode": true
    }; // Create the accessory

    var service = new _WindowCoveringAccessory["default"]('Test', _homebridge.log, config, _homebridge.api); // Check we got a service back

    expect(service instanceof _homebridge.api.hap.Service.WindowCovering).toEqual(true);
  });
  test("Check Button Set", function () {
    // Config for the accessory
    var config = {
      "id": 99203,
      "name": "Test",
      "adminMode": true
    }; // Spy on calls to send command

    var spy = jest.spyOn(SendCommandMethods, 'sendCommand'); // Create the accessory

    var service = new _WindowCoveringAccessory["default"]('Test', _homebridge.log, config, _homebridge.api); // Fully open the blind

    service.set(100); // Expect button pressed to be UP

    expect(spy).toHaveBeenCalledWith(expect.objectContaining(config), 'Up'); // Wait a while

    jest.runAllTimers(); // Expect to be open

    service.get().then(function (data) {
      expect(data).toEqual(100);
    }); // Fully close the blind

    service.set(0); // Expect button pressed to be DOWN

    expect(spy).toHaveBeenCalledWith(expect.objectContaining(config), 'Down'); // Wait a while

    jest.runAllTimers(); // Expect to be closed

    service.get().then(function (data) {
      expect(data).toEqual(0);
    });
  });
  test("Check My Position Mode", function () {
    // Config for the accessory
    var config = {
      "id": 99204,
      "name": "Test",
      "adminMode": true,
      "openToMyPosition": true
    }; // Spy on calls to send command

    var spy = jest.spyOn(SendCommandMethods, 'sendCommand'); // Create the accessory

    var service = new _WindowCoveringAccessory["default"]('Test', _homebridge.log, config, _homebridge.api); // Fully open the blind

    service.set(100); // Expect button pressed to be MY

    expect(spy).toHaveBeenCalledWith(expect.objectContaining(config), 'My'); // Wait a while

    jest.runAllTimers(); // Expect to be open

    service.get().then(function (data) {
      expect(data).toEqual(100);
    }); // Fully close the blind

    service.set(0); // Expect button pressed to be DOWN

    expect(spy).toHaveBeenCalledWith(expect.objectContaining(config), 'Down'); // Wait a while

    jest.runAllTimers(); // Expect to be closed

    service.get().then(function (data) {
      expect(data).toEqual(0);
    });
  });
});