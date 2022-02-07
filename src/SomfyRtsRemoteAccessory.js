import ButtonAccessory from './ButtonAccessory.js';
import WindowCoveringAccessory from './WindowCoveringAccessory.js';
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
		// Switch services that will be exposed
		this.switchServices = [];

		// If we are in admin mode then we display everything as stateless switches
		// that model button presses.
		if (config.adminMode) {
			let buttons = ['Up', 'Down', 'My', 'Prog'];
		
			buttons.forEach(button => {
				const buttonName = `${config.name} ${button}`;
				
				// Register a button service
				this.switchServices.push(new ButtonAccessory(buttonName, button, log, config, api));
			});
		}

		// Also show the stateful accessory that represents the blind.
		this.switchServices.push(new WindowCoveringAccessory(config.name, log, config, api));

		// Log
		log.debug(`Initialized accessory ${config.name}`);
	}

	/**
	 * Mandatory method for Homebridge
	 * Return a list of services provided by this accessory
	 *
	 * @method getServices
	 * @return {Array} - An array containing the services
	*/
    getServices() {
		return this.switchServices;
	}
}