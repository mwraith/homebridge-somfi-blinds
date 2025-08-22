import SomfyRtsRemoteAccessory from './SomfyRtsRemoteAccessory.js';
import { SomfyRtsPlatform } from './SomfyRtsPlatform.js';

module.exports = (api) => {
	// Old approach for registering accessories directly
	api.registerAccessory('homebridge-somfi-blinds', 'Somfy Blinds', SomfyRtsRemoteAccessory);

	// New approach for registering platforms (supporting child bridges)
    api.registerPlatform('homebridge-somfi-blinds', 'Somfy Blinds Platform', SomfyRtsPlatform);  
};
  