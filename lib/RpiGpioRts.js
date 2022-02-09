"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BUTTON = void 0;
exports.sendCommand = sendCommand;

/**
 * Uses Raspberry Pi GPIO to send waveform data
 * to a 433.42 MHz RF emitter to simulate a Somfy RTS Remote 
 * to control roller shutters
 *
 * Somfy RTS protocole from https://pushstack.wordpress.com/somfy-rts-protocol/
 * Implementation translated from Python https://github.com/Nickduino/Pi-Somfy
 */
// The Raspberry Pi's GPIO pin number linked to the 'data' pin of the RF emitter		
var outPin = 4; // Button options on remote

var BUTTON = {
  My: 0x1,
  Up: 0x2,
  Down: 0x4,
  Prog: 0x8
};
/**
 * Prepare and send a command through the GPIO
 *
 * @method sendCommand
 * @param {String} button - The button pressed: Up, Down, My, Prog
 * @return {Array} - An array containing the services
*/

exports.BUTTON = BUTTON;

function sendCommand(id, button, rollingCode, repetitions) {
  var pigpio = require('pigpio');

  var payloadData = getPayloadData(id, button, rollingCode);
  var waveform = getWaveform(payloadData, repetitions);
  var output = new pigpio.Gpio(outPin, {
    mode: pigpio.Gpio.OUTPUT
  }); // Sending waveform

  output.digitalWrite(0);
  pigpio.waveClear();
  pigpio.waveAddGeneric(waveform);
  var waveId = pigpio.waveCreate();

  if (waveId >= 0) {
    pigpio.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
  }

  while (pigpio.waveTxBusy()) {}

  pigpio.waveDelete(waveId);
}
/**
 * Return the payload data to send as a byte array
 *
 * @method getPayloadData
 * @param {String} button - The button pressed: Up, Down, My, Prog
 * @return {Array} - A byte array containing the payload data to send
*/


function getPayloadData(id, button, rollingCode) {
  var frame = [];
  frame.push(0xA7); // [0] Encryption key. Doesn't matter much

  frame.push(button << 4); // [1] Button pressed? The 4 LSB will be the checksum

  frame.push(rollingCode >> 8); // [2] Rolling code (big endian)

  frame.push(rollingCode & 0xFF); // [3] Rolling code

  frame.push(id & 0xFF); // [4] Remote address (little endian)

  frame.push(id >> 8 & 0xFF); // [5] Remote address

  frame.push(id >> 16); // [6] Remote address
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


function getWaveform(payloadData, repetitions) {
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