"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _ButtonAccessory = _interopRequireDefault(require("../ButtonAccessory.js"));

var _homebridge = require("homebridge");

// Mock the file system methods
jest.mock('fs'); // Mock the PiGpio methods

jest.mock('pigpio'); // Mock homebridge api & logger

jest.mock('homebridge'); // Need to mock timers for the admin buttons that switch off after X ms

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
describe("Testing Button Accessory", function () {
  test("Check Button Initialisation", function () {
    // Config for the accessory
    var config = {
      "id": 99102,
      "name": "Test",
      "adminMode": true
    }; // Create the accessory

    var service = new _ButtonAccessory["default"]('Test Up', 'Up', _homebridge.log, config, _homebridge.api); // Check we got a service back

    expect(service instanceof _homebridge.api.hap.Service.Switch).toEqual(true);
  });
  test("Check Button Set", function () {
    // Config for the accessory
    var config = {
      "id": 99103,
      "name": "Test",
      "adminMode": true
    }; // Create the accessory

    var service = new _ButtonAccessory["default"]('Test Up', 'Up', _homebridge.log, config, _homebridge.api); // Push the button

    service.getCharacteristic(_homebridge.api.hap.Characteristic.On).set(true); // Wait a while

    jest.runAllTimers(); // Expect button to be off

    service.getCharacteristic(_homebridge.api.hap.Characteristic.On).get().then(function (data) {
      expect(data).toEqual(false);
    });
  });
  test("Check Button Get", function () {
    // Config for the accessory
    var config = {
      "id": 99104,
      "name": "Test",
      "adminMode": true
    }; // Create the accessory

    var service = new _ButtonAccessory["default"]('Test Up', 'Up', _homebridge.log, config, _homebridge.api); // Expect button to be off

    service.getCharacteristic(_homebridge.api.hap.Characteristic.On).get().then(function (data) {
      expect(data).toEqual(false);
    });
  });
});