import * as RpiGpioRts from './RpiGpioRts.js';
import * as BlindState from './BlindState.js';
import { doWhileStatement } from '@babel/types';

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
		this.Service = this.api.hap.Service;
		this.Characteristic = this.api.hap.Characteristic;

		// Delay to reset the switch after being pressed
		this.delay = 1000;

		// Switch services that will be exposed
		this.switchServices = {};

		// If we are in admin mode then we display everything as stateless switches
		// that model button presses.
		if (this.config.adminMode) {
			this.registerAdminModeSwitches();
		}
		
		// Also show the stateful accessory that represents the blind.
		this.registerWindowCovering();
	}

	/**
	 * Helper function of constructor. If called adds switch devices
	 * representing 'Up', 'Down', 'My', 'Prog'.
	 * 
	 * These are stateless accessories that represent the options on the remote
	 */
	registerAdminModeSwitches() {
		let buttons = ['Up', 'Down', 'My', 'Prog'];
		
		buttons.forEach(button => {
			const buttonName = `${this.config.name} ${button}`;
			
			let service = new this.Service.Switch(buttonName, button);
			
			// Bind functions to manage events
			service.getCharacteristic(this.Characteristic.On)
					.onGet(this.getButtonOn.bind(this, button))
					.onSet(this.setButtonOn.bind(this, button));

			this.switchServices[button] = service;
		});

		// Set default states to off
		this.states = Object.fromEntries(buttons.map(button => [button,false]));

		this.log.debug(`Initialized accessory ${this.config.name} in Admin Mode`);
	}

	/**
	 * Helper service for the window covering accessory. This is a stateful
	 * accessory that uses a JSON file stored locally to persist the
	 * operational state of the covering.
	 */
	registerWindowCovering() {
		let service = new this.Service.WindowCovering(this.config.name);

		// Current Position
		service.getCharacteristic(this.Characteristic.CurrentPosition)
			.onGet(this.getCurrentPosition.bind(this))
			.setProps({
				minValue: 1,
				maxValue: 100,
				minStep: 100
			});

		// Position State
		service.getCharacteristic(this.Characteristic.PositionState)
			.onGet(this.getPositionState.bind(this));

		// Target Position
		service.getCharacteristic(this.Characteristic.TargetPosition)
			.onGet(this.getTargetPosition.bind(this))
			.onSet(this.setTargetPosition.bind(this))
			.setProps({
				minValue: 1,
				maxValue: 100,
				minStep: 100
			});

		this.switchServices['Toggle'] = service;

		// Log success
		this.log.debug(`Initialized accessory ${this.config.name} in normal mode`);
	}

	/**
	 * Returns the current position of the blind. Since partial covering
	 * is not supported. It is either 100 (ON) or 1 (OFF)
	 *
	 * @returns Integer 100 = ON; 1 = OFF
	 */
	async getCurrentPosition() {
		// Read the state from a file
		const state = BlindState.getOn(this.config.id);

		this.log.debug(`Get current position for ${this.config.id} - ${state}`);

		// 0 = CLOSED; 100 = OPEN
		return state ? 0 : 100;
	}

	/**
	 * Not tracking increasing or decreasing for the moment. Just represent
	 * as being stopped
	 * 
	 * @returns Characteristic.PositionState.STOPPED
	 */
	async getPositionState() {
		return this.api.hap.Characteristic.PositionState.STOPPED;
	}

	/**
	 * Gets the position that the blind is currently moving to. In our case this is always
	 * just the current position.
	 *
	 * @returns Integer 100 = ON; 1 = OFF
	 */
	async getTargetPosition() {
		return this.getCurrentPosition();
	}

	/**
	 * Sets the target position of the blinds. Converts the position
	 * so that 100 = ON and 1 = OFF
	 */
	async setTargetPosition(value) {
		// 0 = CLOSED; 100 = OPEN
		let realValue = value > 0 ? false : true;

		/*
			Work out what button we need to press based on the current position

			Value    Invert
			true     false     = Down
			true     true      = Up
			false    false     = Up
			false    true      = Down
		*/
		let button = this.config.invertToggle ^ realValue ? 'Down' : 'Up';

		// Press button
		this.sendCommand(button);

		// Persist the change to the file
		BlindState.setOn(this.config.id, realValue);

        // Log
		this.log.debug(`Triggered SET for ${this.config.id} - ${value}`);
	}

	/**
	 * Getter for the 'On' characteristic of the buttons when in Admin mode
	 *
	 * @method getOn
	 * @param {String} button - 'Up', 'Down', 'My', 'Prog'
	*/
	async getButtonOn(button) {
		this.log.debug(`Get '${button}' for ${this.config.id} - ${this.states[button]}`);

		// Use the internal array that contains the position
		return this.states[button];
	}
	
	/**
	 * Setter for the 'On' characteristic of the buttons when in Admin mode
	 *
	 * @method setOn
	 * @param {String} button - 'Up', 'Down', 'My', 'Prog'
	 * @param {Object} value - The value for the characteristic
	*/
	async setButtonOn(button, value) {
		this.log.debug(`Function setOn called for button ${button} with value ${value}`);

		this.sendCommand(button);

		// Update current state to on
		this.states[button] = value;

		// After a few seconds switch the state back off again
		if (value === true) {
			this.resetSwitchWithTimeout(button);
		}
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
		// Get current rolling code
		const rollingCode = BlindState.getRollingCode(this.config.id);

        // Emit command
		console.log(`${this.config.id}, ${RpiGpioRts.BUTTON[button]}, ${rollingCode}`);
        RpiGpioRts.sendCommand(this.config.id, RpiGpioRts.BUTTON[button], rollingCode);

        // Advance the rolling code
        BlindState.advanceRollingCode(this.config.id);
    }
}