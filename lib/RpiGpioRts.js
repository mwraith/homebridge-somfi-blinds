"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// Requires https://github.com/joan2937/pigpio installed on the Raspberry Pi
var fs = require('fs');

var pigpio = require('pigpio'); // The Raspberry Pi's GPIO pin number linked to the 'data' pin of the RF emitter		


var outPin = 4;
var output = new pigpio.Gpio(outPin, {
  mode: pigpio.Gpio.OUTPUT
});
/**
 * Class using Raspberry Pi GPIO to send waveform data
 * to a 433.42 MHz RF emitter to simulate a Somfy RTS Remote 
 * to control roller shutters
 *
 * Somfy RTS protocole from https://pushstack.wordpress.com/somfy-rts-protocol/
 * Implementation translated from Python https://github.com/Nickduino/Pi-Somfy
 *
 * @class RpiGpioRts
 */

var RpiGpioRts = /*#__PURE__*/function () {
  /**
   * Constructor of the class RpiGpioRts
   *
   * @constructor
   * @param {Function} log - Log function
   * @param {Object} config - Config object
  */
  function RpiGpioRts(log, config) {
    (0, _classCallCheck2["default"])(this, RpiGpioRts);
    this.log = log;

    if (!config || !config.id) {
      throw new Error("Invalid or missing configuration.");
    }

    this.id = parseInt(config.id);
    this.retrieveRollingCode();
    this.buttons = {
      My: 0x1,
      Up: 0x2,
      Down: 0x4,
      Prog: 0x8
    };
  }
  /**
   * Get the stored value of the rolling code
   *
   * @method retrieveRollingCode
  */


  (0, _createClass2["default"])(RpiGpioRts, [{
    key: "retrieveRollingCode",
    value: function retrieveRollingCode() {
      try {
        var code = fs.readFileSync("./".concat(this.id, ".txt"));

        if (isNaN(parseInt(code))) {
          this.rollingCode = 1;
          this.log.debug("No valid rolling code in file ./".concat(this.id, ".txt, set rolling code to 1"));
        } else {
          this.rollingCode = parseInt(code);
          this.log.debug("Retrieved rolling code ".concat(this.rollingCode, " from file ./").concat(this.id, ".txt"));
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          this.rollingCode = 1;
          this.log.debug("No file ./".concat(this.id, ".txt, set rolling code to 1"));
          return;
        } else {
          throw err;
        }
      }
    }
    /**
     * Store the value of the rolling code
     *
     * @method saveRollingCode
    */

  }, {
    key: "saveRollingCode",
    value: function saveRollingCode() {
      fs.writeFile("./".concat(this.id, ".txt"), this.rollingCode.toString(), function (err) {
        if (err) throw err;
      });
      this.log.debug("Saved rolling code ".concat(this.rollingCode, " in file ./").concat(this.id, ".txt"));
    }
    /**
     * Return the payload data to send as a byte array
     *
     * @method getPayloadData
     * @param {String} button - The button pressed: Up, Down, My, Prog
     * @return {Array} - A byte array containing the payload data to send
    */

  }, {
    key: "getPayloadData",
    value: function getPayloadData(button) {
      var frame = [];
      frame.push(0xA7); // [0] Encryption key. Doesn't matter much

      frame.push(this.buttons[button] << 4); // [1] Button pressed? The 4 LSB will be the checksum

      frame.push(this.rollingCode >> 8); // [2] Rolling code (big endian)

      frame.push(this.rollingCode & 0xFF); // [3] Rolling code

      frame.push(this.id & 0xFF); // [4] Remote address (little endian)

      frame.push(this.id >> 8 & 0xFF); // [5] Remote address

      frame.push(this.id >> 16); // [6] Remote address
      // The checksum is calculated by doing a XOR of all bytes of the frame

      var checksum = frame.reduce(function (acc, cur) {
        return acc ^ cur ^ cur >> 4;
      }, 0);
      checksum &= 15; // Keep the last 4 bits only

      frame[1] |= checksum; // Add the checksum to the 4 LSB
      // The payload data is obfuscated by doing an XOR between
      // the byte to obfuscate and the previous obfuscated byte

      for (var i = 1; i < frame.length; i++) {
        frame[i] ^= frame[i - 1];
      }

      return frame;
    }
    /**
     * Return the waveform to send to the emitter through the GPIO
     *
     * According to https://pushstack.wordpress.com/somfy-rts-protocol/
     * 4 repetitions is enough, even for the Prog button
     *
     * @method getWaveform
     * @param {Array} payloadData - A byte array containing the payload data to send
     * @param {Number} repetitions - The number of time the frame should be sent
     * @return {Array} - Waveform to send
    */

  }, {
    key: "getWaveform",
    value: function getWaveform(payloadData, repetitions) {
      var wf = []; // Wake up pulse + silence

      wf.push({
        gpioOn: outPin,
        gpioOff: 0,
        usDelay: 9415
      });
      wf.push({
        gpioOn: 0,
        gpioOff: outPin,
        usDelay: 89565
      }); // Repeating frames

      for (var j = 0; j < repetitions; j++) {
        // Hardware synchronization
        var loops = j === 0 ? 2 : 7;

        for (var i = 0; i < loops; i++) {
          wf.push({
            gpioOn: outPin,
            gpioOff: 0,
            usDelay: 2560
          });
          wf.push({
            gpioOn: 0,
            gpioOff: outPin,
            usDelay: 2560
          });
        } // Software synchronization


        wf.push({
          gpioOn: outPin,
          gpioOff: 0,
          usDelay: 4550
        });
        wf.push({
          gpioOn: 0,
          gpioOff: outPin,
          usDelay: 640
        }); // Manchester enconding of payload data

        for (var _i = 0; _i < 56; _i++) {
          if (payloadData[parseInt(_i / 8)] >> 7 - _i % 8 & 1) {
            wf.push({
              gpioOn: 0,
              gpioOff: outPin,
              usDelay: 640
            });
            wf.push({
              gpioOn: outPin,
              gpioOff: 0,
              usDelay: 640
            });
          } else {
            wf.push({
              gpioOn: outPin,
              gpioOff: 0,
              usDelay: 640
            });
            wf.push({
              gpioOn: 0,
              gpioOff: outPin,
              usDelay: 640
            });
          }
        } // Interframe gap


        wf.push({
          gpioOn: 0,
          gpioOff: outPin,
          usDelay: 30415
        });
      }

      return wf;
    }
    /**
     * Prepare and send a command through the GPIO
     *
     * @method sendCommand
     * @param {String} button - The button pressed: Up, Down, My, Prog
     * @return {Array} - An array containing the services
    */

  }, {
    key: "sendCommand",
    value: function sendCommand(button) {
      this.log.debug("Function sendCommand with id: ".concat(this.id, ", rolling code: ").concat(this.rollingCode, " and button: ").concat(button));
      var payloadData = this.getPayloadData(button);
      var waveform = this.getWaveform(payloadData, 4); // Sending waveform

      output.digitalWrite(0);
      pigpio.waveClear();
      pigpio.waveAddGeneric(waveform);
      var waveId = pigpio.waveCreate();

      if (waveId >= 0) {
        pigpio.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
      }

      while (pigpio.waveTxBusy()) {}

      pigpio.waveDelete(waveId); // Incrementing rolling code and storing its value for next time

      this.rollingCode++;
      this.saveRollingCode();
    }
  }]);
  return RpiGpioRts;
}();

module.exports = RpiGpioRts;