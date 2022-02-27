"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = exports.api = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var LOGGING_ON = false;
var CHARACTERISTICS = {
  'On': 'ON',
  'CurrentPosition': 'CURRENTPOSITION',
  'TargetPosition': 'TARGETPOSITION',
  'PositionState': {
    DECREASING: 'DECREASING',
    INCREASING: 'INCREASING',
    STOPPED: 'STOPPED',
    toString: function toString() {
      return 'POSITIONSTATE';
    }
  }
};

var MockCharacteristic = /*#__PURE__*/function () {
  function MockCharacteristic() {
    (0, _classCallCheck2["default"])(this, MockCharacteristic);
  }

  (0, _createClass2["default"])(MockCharacteristic, [{
    key: "updateValue",
    value: function updateValue(value) {
      this.value = value;
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
      this.value = value;
      return this.setMethod(value);
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
    key: "setProps",
    value: function setProps(props) {
      this.props = props;
      return this;
    }
  }]);
  return MockCharacteristic;
}();

var SwitchServiceMock = /*#__PURE__*/function () {
  function SwitchServiceMock(buttonName, button) {
    (0, _classCallCheck2["default"])(this, SwitchServiceMock);
    this.buttonName = buttonName;
    this.button = button;
    this.characteristics = {
      'ON': new MockCharacteristic()
    };
  }

  (0, _createClass2["default"])(SwitchServiceMock, [{
    key: "getCharacteristic",
    value: function getCharacteristic(characteristic) {
      return this.characteristics[characteristic];
    }
  }, {
    key: "updateCharacteristic",
    value: function updateCharacteristic(characteristic, value) {
      return this;
    }
  }]);
  return SwitchServiceMock;
}();

var WindowCoveringMock = /*#__PURE__*/function () {
  function WindowCoveringMock(buttonName) {
    (0, _classCallCheck2["default"])(this, WindowCoveringMock);
    this.buttonName = buttonName;
    this.characteristics = {
      'CURRENTPOSITION': new MockCharacteristic(),
      'TARGETPOSITION': new MockCharacteristic(),
      'POSITIONSTATE': new MockCharacteristic()
    };
  }

  (0, _createClass2["default"])(WindowCoveringMock, [{
    key: "getCharacteristic",
    value: function getCharacteristic(characteristic) {
      return this.characteristics[characteristic];
    }
  }, {
    key: "updateCharacteristic",
    value: function updateCharacteristic(characteristic, value) {
      return this;
    }
  }]);
  return WindowCoveringMock;
}();

var api = {
  'hap': {
    'Characteristic': CHARACTERISTICS,
    'Service': {
      'Switch': SwitchServiceMock,
      'WindowCovering': WindowCoveringMock
    }
  }
}; // Mock the Logger for Homebridge

exports.api = api;
var log = {
  debug: function debug(text) {
    if (LOGGING_ON) console.log(text);
  }
};
exports.log = log;