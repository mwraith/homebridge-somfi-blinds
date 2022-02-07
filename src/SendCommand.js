import * as RpiGpioRts from './RpiGpioRts.js';
import * as BlindState from './BlindState.js';

/**
 * Sends a button press command to RpiGpioRts but also maintains the
 * rolling code within the BlindState.
 * 
 * @param {Object} config Homebridge config
 * @param {String} button Button to press (Up/Down/My/Prog)
 */
export function sendCommand(config, button) {
    // Get current rolling code
    const rollingCode = BlindState.getRollingCode(config.id);

    // Number of repetitions to send. Sending multiple times can improve
    // the reception. But equally sending too many can also be picked up
    // as a 'long press' which causes the blind to only move one step.
    const repetitions = config.repetitions || 4;

    // Emit command
    console.log(`${config.id}, ${RpiGpioRts.BUTTON[button]}, ${rollingCode}`);
    RpiGpioRts.sendCommand(config.id, RpiGpioRts.BUTTON[button], rollingCode, repetitions);

    // Advance the rolling code
    BlindState.advanceRollingCode(config.id);
}