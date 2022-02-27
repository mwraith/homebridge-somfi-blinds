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
var Characteristic = _homebridge.api.hap.Characteristic;
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

    var service = new _WindowCoveringAccessory["default"]('Test', _homebridge.log, config, _homebridge.api);
    var TargetPosition = service.getCharacteristic(Characteristic.TargetPosition);
    var CurrentPosition = service.getCharacteristic(Characteristic.CurrentPosition);
    var PositionState = service.getCharacteristic(Characteristic.PositionState); // Fully open the blind

    TargetPosition.set(100); // Expect button pressed to be UP

    expect(spy).toHaveBeenCalledWith(expect.objectContaining(config), 'Up'); // Wait a while

    jest.runAllTimers(); // Expect position to be open

    TargetPosition.get().then(function (data) {
      expect(data).toEqual(100);
    });
    CurrentPosition.get().then(function (data) {
      expect(data).toEqual(100);
    });
    PositionState.get().then(function (data) {
      expect(data).toEqual(Characteristic.PositionState.STOPPED);
    }); // Fully close the blind

    TargetPosition.set(0); // Expect button pressed to be DOWN

    expect(spy).toHaveBeenCalledWith(expect.objectContaining(config), 'Down'); // Wait a while

    jest.runAllTimers(); // Expect to be closed

    TargetPosition.get().then(function (data) {
      expect(data).toEqual(0);
    });
    CurrentPosition.get().then(function (data) {
      expect(data).toEqual(0);
    });
    PositionState.get().then(function (data) {
      expect(data).toEqual(Characteristic.PositionState.STOPPED);
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

    var service = new _WindowCoveringAccessory["default"]('Test', _homebridge.log, config, _homebridge.api);
    var TargetPosition = service.getCharacteristic(Characteristic.TargetPosition);
    var CurrentPosition = service.getCharacteristic(Characteristic.CurrentPosition);
    var PositionState = service.getCharacteristic(Characteristic.PositionState); // Fully open the blind

    TargetPosition.set(100); // Expect button pressed to be MY

    expect(spy).toHaveBeenCalledWith(expect.objectContaining(config), 'My'); // Wait a while

    jest.runAllTimers(); // Expect to be open

    TargetPosition.get().then(function (data) {
      expect(data).toEqual(100);
    });
    CurrentPosition.get().then(function (data) {
      expect(data).toEqual(100);
    });
    PositionState.get().then(function (data) {
      expect(data).toEqual(Characteristic.PositionState.STOPPED);
    }); // Fully close the blind

    TargetPosition.set(0); // Expect button pressed to be DOWN

    expect(spy).toHaveBeenCalledWith(expect.objectContaining(config), 'Down'); // Wait a while

    jest.runAllTimers(); // Expect to be closed

    TargetPosition.get().then(function (data) {
      expect(data).toEqual(0);
    });
    CurrentPosition.get().then(function (data) {
      expect(data).toEqual(0);
    });
    PositionState.get().then(function (data) {
      expect(data).toEqual(Characteristic.PositionState.STOPPED);
    });
  });
  test("Test current position works", function () {
    // Config for the accessory
    var config = {
      "id": 99205,
      "name": "Test",
      "adminMode": false,
      "openToMyPosition": false,
      "blindTimeToOpen": 10000
    }; // Create the accessory

    var service = new _WindowCoveringAccessory["default"]('Test', _homebridge.log, config, _homebridge.api);
    var TargetPosition = service.getCharacteristic(Characteristic.TargetPosition);
    var CurrentPosition = service.getCharacteristic(Characteristic.CurrentPosition); // Fully open the blind

    TargetPosition.set(100); // Wait a while

    jest.advanceTimersByTime(config.blindTimeToOpen * 0.3); // Expect current position to be 30% open

    CurrentPosition.get().then(function (data) {
      expect(data).toEqual(30);
    }); // Wait a while

    jest.advanceTimersByTime(config.blindTimeToOpen * 0.3); // Expect current position to be 60% open

    CurrentPosition.get().then(function (data) {
      expect(data).toEqual(60);
    }); // Finish opening

    jest.runAllTimers(); // Fully close the blind

    TargetPosition.set(0); // Wait a while

    jest.advanceTimersByTime(config.blindTimeToOpen * 0.3); // Expect current position to be 30% closed

    CurrentPosition.get().then(function (data) {
      expect(data).toEqual(70);
    }); // Wait a while longer

    jest.advanceTimersByTime(config.blindTimeToOpen * 0.3); // Expect current position to be 60% closed

    CurrentPosition.get().then(function (data) {
      expect(data).toEqual(40);
    });
  });
  test("Test stopping in partial position", function () {
    // Config for the accessory
    var config = {
      "id": 99206,
      "name": "Test",
      "adminMode": false,
      "openToMyPosition": false,
      "blindTimeToOpen": 10000
    }; // Create the accessory

    var service = new _WindowCoveringAccessory["default"]('Test', _homebridge.log, config, _homebridge.api);
    var TargetPosition = service.getCharacteristic(Characteristic.TargetPosition); // Spy on calls to send command

    var spy = jest.spyOn(SendCommandMethods, 'sendCommand'); // Fully open the blind

    TargetPosition.set(100); // Wait a while

    jest.advanceTimersByTime(config.blindTimeToOpen * 0.3); // Send a closed signal

    TargetPosition.set(0); // Expect button pressed to be MY 

    expect(spy).toHaveBeenCalledWith(expect.objectContaining(config), 'My');
  });
});