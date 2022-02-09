"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _WindowCoveringAccessory = _interopRequireDefault(require("../WindowCoveringAccessory.js"));

var _homebridge = require("homebridge");

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
    }; // Create the accessory

    var service = new _WindowCoveringAccessory["default"]('Test', _homebridge.log, config, _homebridge.api); // Fully open the blind

    service.set(100); // Wait a while

    jest.runAllTimers(); // Expect to be open

    service.get().then(function (data) {
      expect(data).toEqual(100);
    }); // Fully close the blind

    service.set(0); // Wait a while

    jest.runAllTimers(); // Expect to be closed

    service.get().then(function (data) {
      expect(data).toEqual(0);
    });
  });
});