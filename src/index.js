import SomfyRtsRemoteAccessory from '../src/SomfyRtsRemoteAccessory.js';

module.exports = (api) => {
	api.registerAccessory('Somfy Blinds', SomfyRtsRemoteAccessory);
};
  