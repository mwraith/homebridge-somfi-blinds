import { sendCommand } from '../SendCommand.js';
import * as BlindState from '../BlindState.js';

// Mock the file system methods
jest.mock('fs');

describe("Testing Send Command class", () => {
    test("send one command", () => {
        const config = {
            "id": 99100,
            "name": "test"
        };

        sendCommand(config, 'Up');

        // Then get state
        let state = BlindState.getRollingCode(config.id);

        // Check the rolling state is set
        expect(state).toEqual(2);
    });

    test("send two commands", () => {
        const config = {
            "id": 99110,
            "name": "test"
        };

        sendCommand(config, 'Up');

        sendCommand(config, 'Down');

        // Then get state
        let state = BlindState.getRollingCode(config.id);

        // Check the rolling state is set
        expect(state).toEqual(3);
    });
});