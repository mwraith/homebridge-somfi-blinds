import * as BlindState from '../src/BlindState.js';
import * as fs from 'fs';

const clearTests = id => {
    if (fs.existsSync(`./${id}.json`)) {
        fs.rmSync(`./${id}.json`);
    }
};

describe("Testing BlindState class", () => {
    test("on first attempt it should create a new state", () => {
        const id = 99996;

        // First clear out any previous tests
        clearTests(id);

        // Then get state
        let state = BlindState.getRollingCode(id);

        // Check the rolling state is set
        expect(state).toEqual(1);
    });

    test("try setting to ON and receiving status", () => {
        const id = 99997;

        // First clear out any previous tests
        clearTests(id);

        BlindState.setOn(id, true);

        // Then get state
        let state = BlindState.getOn(id);

        // Check the rolling state is set
        expect(state).toEqual(true);

        // And remove
        clearTests(id);
    });

    test("try setting to OFF and receiving status", () => {
        const id = 99998;

        // First clear out any previous tests
        clearTests(id);

        BlindState.setOn(id, false);

        // Then get state
        let state = BlindState.getOn(id);

        // Check the rolling state is set
        expect(state).toEqual(false);

        // And remove
        clearTests(id);
    });

    test("try advancing rolling code and receiving status", () => {
        const id = 99999;

        // First clear out any previous tests
        clearTests(id);

        // Advance twice
        BlindState.advanceRollingCode(id);
        BlindState.advanceRollingCode(id);
        BlindState.advanceRollingCode(id);

        // Then get state
        let state = BlindState.getRollingCode(id);

        // Check the rolling state is advanced to 4
        expect(state).toEqual(4);

        // And remove
        clearTests(id);
    });
});