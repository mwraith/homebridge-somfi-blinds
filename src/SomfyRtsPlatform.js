import SomfyRtsRemoteAccessory from './SomfyRtsRemoteAccessory.js';

/**
 * Class representing a platform that supports mutiple Somfy RTS devices
 * for Homebridge.
 * 
 * Config (platform mode):
 * {
 *   "platform": "SomfyRtsPlatform",
 *   "name": "Somfy RTS",
 *   "devices": [
 *     { "id": "1234", "name": "Living Room Blind", "adminMode": false }
 *   ]
 * }
 * 
 * @class SomfyRtsPlatform
 */
export class SomfyRtsPlatform {

	/**
	 * Constructor of the class SomfyRtsPlatform
	 *
	 * @constructor
	 * @param {Object} log - The Homebridge log
	 * @param {Object} config - The Homebridge config data filtered for this item
	 * @param {Object} api - The Homebridge api
	 */
    constructor(log, config, api) {
        this.log = log;
        this.config = config || {};
        this.api = api;
        this.accessories = new Map();

        // Initialise once loaded
        api.on('didFinishLaunching', () => this.discoverAndSync());

		// Log
		log.debug(`Initialized platform ${config.name}`);
    }

    /**
     * Called by Homebridge for cached accessories restored on startup.
     * @param {PlatformAccessory} accessory
     */
    configureAccessory(accessory) {
        this.accessories.set(accessory.UUID, accessory);
    }

    /**
     * Adds accessories as per the config file
     */
    discoverAndSync() {
        const devices = Array.isArray(this.config.devices) ? this.config.devices : [];
        const seen = new Set();

        for (const dev of devices) {
            // Choose a stable key for UUID generation
            const key = String(dev.id ?? dev.name);
            const uuid = this.api.hap.uuid.generate(`somfy-rts:${key}`);
            seen.add(uuid);

            let acc = this.accessories.get(uuid);

            // Build Services with the same logic as legacy accessory mode
            const legacy = new SomfyRtsRemoteAccessory(this.log, dev, this.api);
            const services = legacy.getServices();

            if (!acc) {
                // Not in cache: create a new PlatformAccessory and register it
                acc = new this.api.platformAccessory(dev.name, uuid);

                // Add all service instances produced by the legacy path
                for (const s of services) {
                    acc.addService(s);
                }

                this.api.registerPlatformAccessories('Somfy Blinds', 'SomfyRtsPlatform', [acc]);
                this.accessories.set(uuid, acc);
                this.log.info(`Registered Somfy device: ${dev.name}`);
            } else {
                // Cached accessory found: refresh non-info services for config changes
                for (const s of acc.services) {
                    if (s.displayName !== 'Accessory Information') {
                        acc.removeService(s);
                    }
                }
                for (const s of services) {
                    acc.addService(s);
                }
                this.log.debug(`Updated Somfy device: ${dev.name}`);
            }
        }

        // Optional tidy-up: remove accessories no longer present in config
        for (const [uuid, acc] of this.accessories) {
            if (!seen.has(uuid)) {
                this.api.unregisterPlatformAccessories('Somfy Blinds', 'SomfyRtsPlatform', [acc]);
                this.accessories.delete(uuid);
                this.log.info(`Unregistered removed device: ${acc.displayName}`);
            }
        }
    }
}
