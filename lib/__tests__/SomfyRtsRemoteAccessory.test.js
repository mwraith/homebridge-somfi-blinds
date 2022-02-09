"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _SomfyRtsRemoteAccessory = _interopRequireDefault(require("../SomfyRtsRemoteAccessory.js"));

var _homebridge = require("homebridge");

// Mock the file system methods
jest.mock('fs'); // Mock the PiGpio methods

jest.mock('pigpio'); // Mock homebridge api & logger

jest.mock('homebridge');
describe("Testing Main Class", function () {
  test("Check services with admin mode", function () {
    // Config for the accessory
    var config = {
      "id": 99100,
      "name": "test",
      "adminMode": true
    }; // Create the accessory

    var rts = new _SomfyRtsRemoteAccessory["default"](_homebridge.log, config, _homebridge.api);
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

    var rts = new _SomfyRtsRemoteAccessory["default"](_homebridge.log, config, _homebridge.api);
    var services = rts.getServices(); // Check we have the main service only

    expect(services.length).toEqual(1);
  });
});