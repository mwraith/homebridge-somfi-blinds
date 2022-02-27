import WindowCoveringAccessory from '../WindowCoveringAccessory.js';
import { api, log } from 'homebridge';
import * as SendCommandMethods from '../SendCommand.js';

// Mock the file system methods
jest.mock('fs');

// Mock the PiGpio methods
jest.mock('pigpio');

// Mock homebridge api & logger
jest.mock('homebridge');

// Need to mock timers for the admin buttons that switch off after X ms
jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

const Characteristic = api.hap.Characteristic;

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

        // Spy on calls to send command
        const spy = jest.spyOn(SendCommandMethods, 'sendCommand');

        // Create the accessory
        let service = new WindowCoveringAccessory('Test', log, config, api);
        let TargetPosition = service.getCharacteristic(Characteristic.TargetPosition);
        let CurrentPosition = service.getCharacteristic(Characteristic.CurrentPosition);
        let PositionState = service.getCharacteristic(Characteristic.PositionState);

        // Fully open the blind
        TargetPosition.set(100);

        // Expect button pressed to be UP
        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining(config),
            'Up'
        );

        // Wait a while
        jest.runAllTimers();

        // Expect position to be open
        TargetPosition.get().then(data => {
            expect(data).toEqual(100);
        });
        CurrentPosition.get().then(data => {
            expect(data).toEqual(100);
        });
        PositionState.get().then(data => {
            expect(data).toEqual(Characteristic.PositionState.STOPPED);
        });

        // Fully close the blind
        TargetPosition.set(0);

        // Expect button pressed to be DOWN
        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining(config),
            'Down'
        );

        // Wait a while
        jest.runAllTimers();

        // Expect to be closed
        TargetPosition.get().then(data => {
            expect(data).toEqual(0);
        });
        CurrentPosition.get().then(data => {
            expect(data).toEqual(0);
        });
        PositionState.get().then(data => {
            expect(data).toEqual(Characteristic.PositionState.STOPPED);
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

        // Spy on calls to send command
        const spy = jest.spyOn(SendCommandMethods, 'sendCommand');

        // Create the accessory
        let service = new WindowCoveringAccessory('Test', log, config, api);
        let TargetPosition = service.getCharacteristic(Characteristic.TargetPosition);
        let CurrentPosition = service.getCharacteristic(Characteristic.CurrentPosition);
        let PositionState = service.getCharacteristic(Characteristic.PositionState);

        // Fully open the blind
        TargetPosition.set(100);

        // Expect button pressed to be MY
        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining(config),
            'My'
        );

        // Wait a while
        jest.runAllTimers();

        // Expect to be open
        TargetPosition.get().then(data => {
            expect(data).toEqual(100);
        });
        CurrentPosition.get().then(data => {
            expect(data).toEqual(100);
        });
        PositionState.get().then(data => {
            expect(data).toEqual(Characteristic.PositionState.STOPPED);
        });

        // Fully close the blind
        TargetPosition.set(0);

        // Expect button pressed to be DOWN
        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining(config),
            'Down'
        );

        // Wait a while
        jest.runAllTimers();

        // Expect to be closed
        TargetPosition.get().then(data => {
            expect(data).toEqual(0);
        });
        CurrentPosition.get().then(data => {
            expect(data).toEqual(0);
        });
        PositionState.get().then(data => {
            expect(data).toEqual(Characteristic.PositionState.STOPPED);
        });
    });


    test("Test current position works", () => {
        // Config for the accessory
        const config = {
            "id": 99205,
            "name": "Test",
            "adminMode": false,
            "openToMyPosition": false,
            "blindOpenDelay": 10000
        };

        // Create the accessory
        let service = new WindowCoveringAccessory('Test', log, config, api);
        let TargetPosition = service.getCharacteristic(Characteristic.TargetPosition);
        let CurrentPosition = service.getCharacteristic(Characteristic.CurrentPosition);

        // Fully open the blind
        TargetPosition.set(100);

        // Wait a while
        jest.advanceTimersByTime(config.blindOpenDelay*0.3);

        // Expect current position to be 30% open
        CurrentPosition.get().then(data => {
            expect(data).toEqual(30);
        });

        // Wait a while
        jest.advanceTimersByTime(config.blindOpenDelay*0.3);

        // Expect current position to be 60% open
        CurrentPosition.get().then(data => {
            expect(data).toEqual(60);
        });

        // Finish opening
        jest.runAllTimers();

        // Fully close the blind
        TargetPosition.set(0);

        // Wait a while
        jest.advanceTimersByTime(config.blindOpenDelay*0.3);

        // Expect current position to be 30% closed
        CurrentPosition.get().then(data => {
            expect(data).toEqual(70);
        });

        // Wait a while longer
        jest.advanceTimersByTime(config.blindOpenDelay*0.3);

        // Expect current position to be 60% closed
        CurrentPosition.get().then(data => {
            expect(data).toEqual(40);
        });
    });
});