"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = exports.api = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var LOGGING_ON = false;

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
    key: "updateCharacteristic",
    value: function updateCharacteristic(characteristic, value) {
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
}();

var WindowCoveringMock = /*#__PURE__*/function () {
  function WindowCoveringMock(buttonName) {
    (0, _classCallCheck2["default"])(this, WindowCoveringMock);
    this.buttonName = buttonName;
    this.methods = [];
  }

  (0, _createClass2["default"])(WindowCoveringMock, [{
    key: "getCharacteristic",
    value: function getCharacteristic(characteristic) {
      return this;
    }
  }, {
    key: "updateCharacteristic",
    value: function updateCharacteristic(characteristic, value) {
      return this;
    }
  }, {
    key: "onGet",
    value: function onGet(f) {
      this.getMethod = f;
      return this;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
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
  return WindowCoveringMock;
}(); // Mock the Logger for Homebridge


var log = {
  debug: function debug(text) {
    if (LOGGING_ON) console.log(text);
  }
};
exports.log = log;
var api = {
  'hap': {
    'Characteristic': {
      'On': 1
    },
    'Service': {
      'Switch': SwitchServiceMock,
      'WindowCovering': WindowCoveringMock
    }
  }
};
exports.api = api;