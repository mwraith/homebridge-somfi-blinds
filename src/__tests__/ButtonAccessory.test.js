import ButtonAccessory from '../ButtonAccessory.js';
import { api, log } from 'homebridge';

// Mock the file system methods
jest.mock('fs');

// Mock the PiGpio methods
jest.mock('pigpio');

// Mock homebridge api & logger
jest.mock('homebridge');

// Need to mock timers for the admin buttons that switch off after X ms
jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

describe("Testing Button Accessory", () => {

    test("Check Button Initialisation", () => {
        // Config for the accessory
        const config = {
            "id": 99102,
            "name": "Test",
            "adminMode": true
        };

        // Create the accessory
        let service = new ButtonAccessory('Test Up', 'Up', log, config, api);

        // Check we got a service back
        expect(service instanceof api.hap.Service.Switch).toEqual(true);
    });

    test("Check Button Set", () => {
        // Config for the accessory
        const config = {
            "id": 99103,
            "name": "Test",
            "adminMode": true
        };

        // Create the accessory
        let service = new ButtonAccessory('Test Up', 'Up', log, config, api);

        // Push the button
        service.getCharacteristic(api.hap.Characteristic.On).set(true)

        // Wait a while
        jest.runAllTimers();

        // Expect button to be off
        service.getCharacteristic(api.hap.Characteristic.On).get().then(data => {
            expect(data).toEqual(false);
        });
    });

    test("Check Button Get", () => {
        // Config for the accessory
        const config = {
            "id": 99104,
            "name": "Test",
            "adminMode": true
        };

        // Create the accessory
        let service = new ButtonAccessory('Test Up', 'Up', log, config, api);

        // Expect button to be off
        service.getCharacteristic(api.hap.Characteristic.On).get().then(data => {
            expect(data).toEqual(false);
        });
    });
});