import * as BlindState from '../BlindState.js';

// Mock the file system methods
jest.mock('fs');

describe("Testing BlindState class", () => {
    test("on first attempt it should create a new state", () => {
        // Then get state
        let state = BlindState.getRollingCode(99000);

        // Check the rolling state is set
        expect(state).toEqual(1);
    });

    test("try setting to ON and receiving status", () => {
        BlindState.setOn(99001, true);

        // Then get state
        let state = BlindState.getOn(99001);

        // Check the rolling state is set
        expect(state).toEqual(true);
    });

    test("try setting to OFF and receiving status", () => {
        BlindState.setOn(99002, false);

        // Then get state
        let state = BlindState.getOn(99002);

        // Check the rolling state is set
        expect(state).toEqual(false);
    });

    test("try advancing rolling code and receiving status", () => {
        // Advance twice
        BlindState.advanceRollingCode(99003);
        BlindState.advanceRollingCode(99003);
        BlindState.advanceRollingCode(99003);

        // Then get state
        let state = BlindState.getRollingCode(99003);

        // Check the rolling state is advanced to 4
        expect(state).toEqual(4);
    });
});