"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");

var BlindState = _interopRequireWildcard(require("../BlindState.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Mock the file system methods
jest.mock('fs');
describe("Testing BlindState class", function () {
  test("on first attempt it should create a new state", function () {
    // Then get state
    var state = BlindState.getRollingCode(99000); // Check the rolling state is set

    expect(state).toEqual(1);
  });
  test("try setting to ON and receiving status", function () {
    BlindState.setOn(99001, true); // Then get state

    var state = BlindState.getOn(99001); // Check the rolling state is set

    expect(state).toEqual(true);
  });
  test("try setting to OFF and receiving status", function () {
    BlindState.setOn(99002, false); // Then get state

    var state = BlindState.getOn(99002); // Check the rolling state is set

    expect(state).toEqual(false);
  });
  test("try advancing rolling code and receiving status", function () {
    // Advance twice
    BlindState.advanceRollingCode(99003);
    BlindState.advanceRollingCode(99003);
    BlindState.advanceRollingCode(99003); // Then get state

    var state = BlindState.getRollingCode(99003); // Check the rolling state is advanced to 4

    expect(state).toEqual(4);
  });
});