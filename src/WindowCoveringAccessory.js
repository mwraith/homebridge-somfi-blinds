// Used to read the current state of the blind from file storage
import * as BlindState from './BlindState.js';

// Helper class used to send the commands to RpiGpioRts whilst maintaining
// the rolling code correctly.
import { sendCommand } from './SendCommand.js';

/**
 * Accessory resembles the blind itself and extends the WindowCovering
 * service in Apple HomeKit.
 * 
 * Whilst the HomeKit accessory supports partial covering (e.g. 40% open)
 * the Somfy blinds do not as there is no way to retrieve the current
 * position. The accessory therefore uses a Step Value of 100 in the
 * TargetPosition to avoid users being able to set partial positioning.
 * 
 * Although getting the current position isn't possible, the accessory
 * effectively mocks the CurrentPosition and PositionState such that after
 * sending a request to set the target position the accessory 'appears' that
 * it's in moving state for a certain delay.
 * 
 */
export default class WindowCoveringAccessory {

    /**
     * Creates a new stateful window covering service.
     * 
     * @param {String} name    Label for the service
     * @param {Object} log     Homebridge log object
     * @param {Object} config  Homebridge config object
     * @param {Object} api     Homebridge api object
     * @returns {api.hap.Service}  Homebridge Service
     */
    constructor(name, log, config, api) {
        this.name = name;
		this.log = log;
		this.config = config;
		this.api = api;

        // Time for the blind to open/close in milliseconds (mocked)
        this.delay = this.config.blindOpenDelay || 5000;

        // Register a switch service
        this.service = new this.api.hap.Service.WindowCovering(this.config.name);

		// Tracks the last state triggered by the user. Used to assist with the
		// mocking of the blind moving up and down.
		this.lastChange = {};
			
		// Current Position
		this.service.getCharacteristic(this.api.hap.Characteristic.CurrentPosition)
			.onGet(this.getCurrentPosition.bind(this))
			.setProps({
				minValue: 0,
				maxValue: 100,
				minStep: 1
			});

		// Position State
		this.service.getCharacteristic(this.api.hap.Characteristic.PositionState)
			.onGet(this.getPositionState.bind(this));

		// Target Position
		this.service.getCharacteristic(this.api.hap.Characteristic.TargetPosition)
			.onGet(this.getTargetPosition.bind(this))
			.onSet(this.setTargetPosition.bind(this))
			.setProps({
				minValue: 0,
				maxValue: 100,
				minStep: 100
			});

        return this.service;
    }

	/**
	 * Returns the current position of the blind. Since partial covering
	 * is not supported. It is either 100 (ON) or 1 (OFF)
	 *
	 * @returns Integer 100 = ON; 1 = OFF
	 */
    async getCurrentPosition() {
		// Decide whether to get the current position from the mocked state or from
		// the BlindState file. The mocked state is just used for a few seconds after 
		// changing to give a better visual appearance in Home Kit
		if (this.isBlindCurrentlyMoving()) {
			let percentComplete = (Date.now() - this.lastChange.timestamp) / this.delay;

			// Round to integer
			percentComplete = Math.round(percentComplete);

			// Ensure it hasn't gone over 100
			percentComplete = percentComplete > 100 ? 100 : percentComplete;

			this.log.debug(`Getting current position for ${this.config.id} - ${percentComplete} from mocked value`);
			
			// The percentage complete can just be returned if the blind 
			// is moving to position 100. If it's moving to 0, invert it.
			if (this.lastChange.value == 100) {
				return percentComplete;
			}
			else {
				return 100 - percentComplete;
			}
		}
		else {
			this.log.debug(`Getting current position from file`);

			// Otherwise the current position is the same as the target position
			return this.getTargetPosition();
		}
	}

	/**
	 * Uses the 'mocked' timestamp to understand if the blind is currently moving. If
	 * so the state is taken from the mock values rather than the BlindState to give
	 * the appearance of moving.
	 * 
	 * @returns {Boolean} TRUE if blind is currently moving; FALSE otherwise
	 */
	isBlindCurrentlyMoving() {
		return this.lastChange.timestamp && (Date.now() - this.lastChange.timestamp) < this.delay;
	}

	/**
	 * Sets the target position of the blinds. Converts the position
	 * so that 100 = ON and 1 = OFF
	 */
	async setTargetPosition(value) {
		// 0 = CLOSED (state = true)
		// 100 = OPEN (state = false)
		let internalState = value > 0 ? false : true;

		// Work out what button we need to press based on the current position and
		// whether the blinds should open to My Position instead of fully open
		// (e.g. for venetian blinds MY is used to set partial tilt)
		let button;
		
		if (this.config.openToMyPosition) {
			/*
				Target State    Invert
				true (CLOSED)   false     = Down
				true (CLOSED)   true      = Up
				false (OPEN)    false     = My
				false (OPEN)    true      = My
			*/
			button = !internalState ? 'My'
				   : this.config.invertToggle ? 'Up'
				   : 'Down';
		}
		else {
			/*
				Target State    Invert
				true (CLOSED)   false     = Down
				true (CLOSED)   true      = Up
				false (OPEN)    false     = Up
				false (OPEN)    true      = Down
			*/
			button = this.config.invertToggle ^ internalState ? 'Down' : 'Up';
		}

		// Send button press to RpiGpioRts
		sendCommand(this.config, button);

		// Persist the change to the file
		BlindState.setOn(this.config.id, internalState);

		// Track the request, which is used by getPositionState, getCurrentPosition
		// and getTargetPosition
		this.lastChange = {
			'timestamp': Date.now(),
			'button': button,
			'targetValue': value
		};

        // Log
		this.log.debug(`Triggered SET for ${this.config.id} - ${value}`);
	}

	/**
	 * Not tracking increasing or decreasing for the moment. Just represent
	 * as being stopped
	 * 
	 * @returns Characteristic.PositionState.STOPPED
	 */
	async getPositionState() {
		const PositionState = this.api.hap.Characteristic.PositionState;

		// If the blind is currently moving then display the direction. Otherwise
		// show 'STOPPED' as the state
		if (this.isBlindCurrentlyMoving()) {
			return this.lastChange.targetValue > 0 ? PositionState.INCREASING : PositionState.DECREASING;
		}
		else {
			return PositionState.STOPPED;
		}
	}

	/**
	 * Gets the position for the blind from BlindState.
	 *
	 * @returns Integer
	 */
	async getTargetPosition() {
		// Read the state from a file
		const state = BlindState.getOn(this.config.id);

		this.log.debug(`Get target position for ${this.config.id} - ${state} from file`);

		// Convert state
		// 0 = CLOSED (state = true)
		// 100 = OPEN (state = false)
		return state ? 0 : 100;
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
}