// Helper class used to send the commands to RpiGpioRts whilst maintaining
// the rolling code correctly.
import { sendCommand } from './SendCommand.js';

/**
 * Creates a new stateless button. We are using the 'Switch'
 * service in Apple HomeKit since there is no such Button accessory.
 * 
 * This accessory is only used for the 'UP', 'DOWN', 'PROG', 'MY'
 * buttons that are shown when in Admin Mode. The switch works in such
 * a way that user turns to On position when they want to press the button
 * and after a short delay the Switch automatically turns itself
 * back to Off position.
 * 
 * For the main accessory that resembles the Blind itseld refer to the
 * WindowCoveringAccessory class.
 */
export default class ButtonAccessory {
    /**
     * Constructor for a a new stateless button. Used for the 'UP', 'DOWN', 'PROG', 'MY'
     * buttons that are shown when in Admin Mode.
     * 
     * @param {String} name    Label for the button
     * @param {String} button  Up/Down/My/Prog
     * @param {Object} log     Homebridge log object
     * @param {Object} config  Homebridge config object
     * @param {Object} api     Homebridge api object
     * @returns {api.hap.Service}  Homebridge Service
     */
    constructor(name, button, log, config, api) {
        this.name = name;
        this.button = button;
		this.log = log;
		this.config = config;
		this.api = api;

		// Delay to reset the switch after being pressed
		this.delay = 1000;

        // Set current state of button to false
        this.state = false;

        // Register a switch service
        this.service = new this.api.hap.Service.Switch(name, button);
			
        // Bind functions to manage events
        this.service.getCharacteristic(this.api.hap.Characteristic.On)
                    .onGet(this.getButtonOn.bind(this))
                    .onSet(this.setButtonOn.bind(this));

        return this.service;
    }

	/**
	 * Getter for the 'On' characteristic of the button just returns from the 
     * internal state.
	 *
	 * @method getOn
	*/
	async getButtonOn() {
		this.log.debug(`Get '${this.button}' for ${this.config.id} - ${this.state}`);

		// Use the internal array that contains the position
		return this.state;
	}
	
	/**
	 * Setter for the 'On' characteristic, sets the internal state and creates
     * a timer that after a delay changes the button to off again. This models
     * the behaviour of the button represented with a switch.
	 *
	 * @method setOn
	 * @param {Object} value - The value for the characteristic
	*/
	async setButtonOn(value) {
		this.log.debug(`Function setOn called for button ${this.button} with value ${value}`);

		// Send button press to RpiGpioRts
		sendCommand(this.config, this.button);

		// Update current state to on
		this.state = value;

		// After a few seconds switch the state back off again
		if (value === true) {
			this.resetSwitchWithTimeout();
		}
	}

	/**
	 * Reset the switch to false to simulate a stateless behavior
	 *
	 * @method resetSwitchWithTimeout
	*/
	resetSwitchWithTimeout() {
		this.log.debug(`Function resetSwitchWithTimeout called for button ${this.button}`);

		setTimeout(function() {
            this.log.debug(`Auto switching button ${this.button}`);

            this.state = false;
			this.service.updateCharacteristic(this.api.hap.Characteristic.On, false);
		}.bind(this), this.delay);
	}
}