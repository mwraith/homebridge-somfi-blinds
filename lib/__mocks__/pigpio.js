"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Gpio = void 0;
exports.waveAddGeneric = waveAddGeneric;
exports.waveClear = waveClear;
exports.waveCreate = waveCreate;
exports.waveDelete = waveDelete;
exports.waveTxBusy = waveTxBusy;
exports.waveTxSend = waveTxSend;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

/**
 * Mock the PiGpio class
 */
var Gpio = /*#__PURE__*/function () {
  function Gpio() {
    (0, _classCallCheck2["default"])(this, Gpio);
  }

  (0, _createClass2["default"])(Gpio, [{
    key: "digitalWrite",
    value: function digitalWrite() {}
  }]);
  return Gpio;
}();

exports.Gpio = Gpio;

function waveClear() {}

function waveAddGeneric() {}

function waveCreate() {}

function waveTxSend() {}

function waveTxBusy() {}

function waveDelete() {}