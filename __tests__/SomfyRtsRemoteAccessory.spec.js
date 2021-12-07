import SomfyRtsRemoteAccessory from '../src/SomfyRtsRemoteAccessory.js';
import * as fs from 'fs';
import * as BlindState from '../src/BlindState.js';

// Need to mock timers for the admin buttons that switch off after X ms
jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

const LOGGING_ON = false;

// Mock the Logger for Homebridge
const log = {
    debug: function(text) { if (LOGGING_ON) console.log(text); }
}

// Switch Server
class SwitchServiceMock {
    constructor(buttonName, button) {
        this.buttonName = buttonName;
        this.button = button;
        this.methods = [];
    }

    getCharacteristic(characteristic) {
        return this;
    }

    setCharacteristic(characteristic, value) {
        return this;
    }

    on(method, f) {
        this.methods[method] = f;

        return this;
    }

    get() {
        return this.methods["get"]();
    }

    set(value) {
        return this.methods["set"](value);
    }
}

// Mock the API for Homebridge
const api = {
    "hap": {
        "Characteristic": {
            "On": 1
        },
        "Service": {
            "Switch": SwitchServiceMock
        }
    }
};

const clearTests = config => {
    if (fs.existsSync(`./${config.id}.json`)) {
        fs.rmSync(`./${config.id}.json`);
    }
};

describe("Testing Main Class", () => {
    test("check services with admin mode", () => {
        // Config for the accessory
        const config = {
            "id": 99900,
            "name": "test",
            "adminMode": true
        };

        // First clear out any previous tests
        clearTests(config);

        // Create the accessory
        let rts = new SomfyRtsRemoteAccessory(log, config, api);
        let services = rts.getServices();

        // Check we have Toggle, Up, Down, My, Prog buttons
        expect(services.length).toEqual(5);

        // Clear again
        clearTests(config);
    });

    test("check services with non admin mode", () => {
        // Config for the accessory
        const config = {
            "id": 99901,
            "name": "test",
            "adminMode": false
        };

        // First clear out any previous tests
        clearTests(config);

        // Create the accessory
        let rts = new SomfyRtsRemoteAccessory(log, config, api);
        let services = rts.getServices();

        // Check we have Toggle only
        expect(services.length).toEqual(1);

        // Clear again
        clearTests(config);
    });
/*
    test("check admin buttons", () => {
        // Config for the accessory
        const config = {
            "id": 99902,
            "name": "test",
            "adminMode": true
        };

        // First clear out any previous tests
        clearTests(config);

        // Create the accessory
        let rts = new SomfyRtsRemoteAccessory(log, config, api);
        let services = rts.getServices();

        // Toggle all of the admin buttons
        services.forEach(s => {
            if (s.buttonName != 'Toggle') {
                s.set(true);
            }
        });

        // Get all of the admin button states. Should be on
        services.forEach(s => {
            if (s.button != 'Toggle') {
                s.get().then(data => {
                    //expect(data).toEqual(true);
                });
            }
        });

        // Fast-forward until all timers have been executed
        jest.runAllTimers();

        if (LOGGING_ON)
            console.log('Post timer tests');

        // Try all of the admin button states again. Should be off
        services.forEach(s => {
            if (s.button != 'Toggle') {
                s.get().then(data => {
                    //expect(data).toEqual(false);
                });
            }
        });

        // Clear again
        clearTests(config);
    });

    test("check toggle button", () => {
        // Config for the accessory
        const config = {
            "id": 99903,
            "name": "test",
            "adminMode": false
        };

        // First clear out any previous tests
        clearTests(config);

        // Create the accessory
        let rts = new SomfyRtsRemoteAccessory(log, config, api);
        let services = rts.getServices();

        // Close blind
        services[0].set(true);

        services[0].get().then(data => {
            expect(data).toEqual(true);
        });

        // Open blind
        services[0].set(false);

        services[0].get().then(data => {
            expect(data).toEqual(false);
        });

        // Check the rolling code has been advanced by 2
        const configNew = BlindState.get(config.id);
        expect(configNew.rollingCode).toEqual(3);

        // Clear again
        clearTests(config);
    });*/
});