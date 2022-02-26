import WindowCoveringAccessory from '../WindowCoveringAccessory.js';
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


describe("Testing Window Covering Accessory", () => {

    test("Check Window Covering Initialisation", () => {
        // Config for the accessory
        const config = {
            "id": 99201,
            "name": "Test",
            "adminMode": true
        };

        // Create the accessory
        let service = new WindowCoveringAccessory('Test', log, config, api);

        // Check we got a service back
        expect(service instanceof api.hap.Service.WindowCovering).toEqual(true);
    });

    test("Check Button Set", () => {
        // Config for the accessory
        const config = {
            "id": 99203,
            "name": "Test",
            "adminMode": true
        };

        // Create the accessory
        let service = new WindowCoveringAccessory('Test', log, config, api);

        // Fully open the blind
        service.set(100);

        // Wait a while
        jest.runAllTimers();

        // Expect to be open
        service.get().then(data => {
            expect(data).toEqual(100);
        });

        // Fully close the blind
        service.set(0);

        // Wait a while
        jest.runAllTimers();

        // Expect to be closed
        service.get().then(data => {
            expect(data).toEqual(0);
        });
    });


    test("Check My Position Mode", () => {
        // Config for the accessory
        const config = {
            "id": 99204,
            "name": "Test",
            "adminMode": true,
            "openToMyPosition": true
        };

        // Create the accessory
        let service = new WindowCoveringAccessory('Test', log, config, api);

        // Fully open the blind
        service.set(100);

        // Wait a while
        jest.runAllTimers();

        // Expect to be open
        service.get().then(data => {
            expect(data).toEqual(100);
        });

        // Fully close the blind
        service.set(0);

        // Wait a while
        jest.runAllTimers();

        // Expect to be closed
        service.get().then(data => {
            expect(data).toEqual(0);
        });
    });
});