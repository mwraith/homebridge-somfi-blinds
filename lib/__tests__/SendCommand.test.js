"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");

var _SendCommand = require("../SendCommand.js");

var BlindState = _interopRequireWildcard(require("../BlindState.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Mock the file system methods
jest.mock('fs');
describe("Testing Send Command class", function () {
  test("send one command", function () {
    var config = {
      "id": 99100,
      "name": "test"
    };
    (0, _SendCommand.sendCommand)(config, 'Up'); // Then get state

    var state = BlindState.getRollingCode(config.id); // Check the rolling state is set

    expect(state).toEqual(2);
  });
  test("send two commands", function () {
    var config = {
      "id": 99110,
      "name": "test"
    };
    (0, _SendCommand.sendCommand)(config, 'Up');
    (0, _SendCommand.sendCommand)(config, 'Down'); // Then get state

    var state = BlindState.getRollingCode(config.id); // Check the rolling state is set

    expect(state).toEqual(3);
  });
});