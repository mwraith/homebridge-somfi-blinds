//const RpiGpioRts = require('./RpiGpioRts');
import * as BlindState from './BlindState.js';

/**
 * Class simulating a Somfy RTS Remote Accessory for Homebridge
 * with a simple stateful on/off switch
 *
 * @class SomfyRtsRemoteAccessory
 */
 export default class SomfyRtsRemoteAccessory {

	/**
	 * Constructor of the class SomfyRtsRemoteAccessory
	 *
	 * @constructor
	 * @param {Object} log - The Homebridge log
	 * @param {Object} config - The Homebridge config data filtered for this item
	 * @param {Object} api - The Homebridge api
	 */
	constructor(log, config, api) {
		this.log = log;
		this.config = config;
		this.api = api;
		//this.emitter = new RpiGpioRts(log, config);

		const Service = this.api.hap.Service;
		const Characteristic = this.api.hap.Characteristic;

		// Delay to reset the switch after being pressed
		this.delay = 1000;

		// Decide what buttons the user should get
		let buttons = this.config.adminMode ? ['Toggle', 'Up', 'Down', 'My', 'Prog'] : ['Toggle'];

		// Create Switches
        this.switchServices = {};

		buttons.forEach(button => {
			const buttonName = button == 'Toggle' ? this.config.name : `${this.config.name} ${button}`;
			
			let service = new Service.Switch(buttonName, button);
			
			// Bind functions to manage events
			service.getCharacteristic(Characteristic.On)
					.onGet(this.getOn.bind(this, button))
					.onSet(this.setOn.bind(this, button));

            this.switchServices[button] = service;
		});

		// Set default states to off
		this.states = Object.fromEntries(buttons.map(button => [button,false]));

		// Log success
		this.log.debug(`Initialized accessory ${this.config.name}`);
	}

	/**
	 * Getter for the 'On' characteristic of the 'Switch' service
	 *
	 * @method getOn
	 * @param {String} button - 'Toggle', 'Up', 'Down', 'My', 'Prog'
	*/
	async getOn(button) {
		if (button == 'Toggle') {
			// For the toggle button let's read the state from a file
			const state = BlindState.getOn(this.config.id);
	
			this.log.debug(`Get 'Toggle' for ${this.config.id} - ${state}`);

			return state;
		}
		else {
            this.log.debug(`Get '${button}' for ${this.config.id} - ${this.states[button]}`);

			// For other buttons we use the internal array
			return this.states[button];
		}
	}
	
	/**
	 * Setter for the 'On' characteristic of the 'Switch' service
	 *
	 * @method setOn
	 * @param {String} button - 'Toggle', 'Up', 'Down', 'My', 'Prog'
	 * @param {Object} value - The value for the characteristic
	*/
	async setOn(button, value) {
		this.log.debug(`Function setOn called for button ${button} with value ${value}`);

		if (button == 'Toggle') {
			// For the Toggle button we persist the change to the file
			const state = BlindState.setOn(this.config.id, value);

            // Log
			const stringifyState = JSON.stringify(state);
			this.log.debug(`Triggered SET for ${this.config.id} - ${stringifyState}`);
		}
		else {
			// For other buttons we change the internal state and set a timer to change it back
			// in X ms
			this.states[button] = value;

			if (value === true) {
				this.resetSwitchWithTimeout(button);
			}
		}

        this.sendCommand(button);
	}

	/**
	 * Reset the switch to false to simulate a stateless behavior
	 *
	 * @method resetSwitchWithTimeout
	 * @param {String} button - 'Up', 'Down', 'My', 'Prog'
	*/
	resetSwitchWithTimeout(button) {
		this.log.debug(`Function resetSwitchWithTimeout called for button ${button}`);

		setTimeout(function() {
            this.log.debug(`Auto switching button ${button}`);

            this.states[button] = false;
			this.switchServices[button].updateCharacteristic(this.api.hap.Characteristic.On, false);
		}.bind(this), this.delay);
	}
	
	/**
	 * Mandatory method for Homebridge
	 * Return a list of services provided by this accessory
	 *
	 * @method getServices
	 * @return {Array} - An array containing the services
	*/
    getServices() {
		return Object.values(this.switchServices);
	}

    /**
     * Send a command to the device
     */
    sendCommand(button) {
        // Emit command
        // this.emitter.sendCommand(button);

        // Advance the rolling code
        BlindState.advanceRollingCode(this.config.id);
    }
}