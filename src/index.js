import SomfyRtsRemoteAccessory from './SomfyRtsRemoteAccessory.js';
import { SomfyRtsPlatform } from './SomfyRtsPlatform.js';

module.exports = (api) => {
	// Old approach for registering accessories directly
	api.registerAccessory('Somfy Blinds', SomfyRtsRemoteAccessory);

	// New approach for registering platforms (supporting child bridges)
    api.registerPlatform('Somfy Blinds', 'SomfyRtsPlatform', SomfyRtsPlatform);  
};
  