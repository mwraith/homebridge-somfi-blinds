import { sendCommand } from '../SendCommand.js';
import * as BlindState from '../BlindState.js';
import { api } from 'homebridge';

// Mock the file system methods
jest.mock('fs');

describe("Testing Send Command class", () => {
    test("send one command", () => {
        const config = {
            "id": 99100,
            "name": "test"
        };

        sendCommand(api, config, 'Up');

        // Then get state
        let state = BlindState.getRollingCode(api, config.id);

        // Check the rolling state is set
        expect(state).toEqual(2);
    });

    test("send two commands", () => {
        const config = {
            "id": 99110,
            "name": "test"
        };

        sendCommand(api, config, 'Up');

        sendCommand(api, config, 'Down');

        // Then get state
        let state = BlindState.getRollingCode(api, config.id);

        // Check the rolling state is set
        expect(state).toEqual(3);
    });
});