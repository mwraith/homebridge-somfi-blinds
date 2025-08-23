import * as fs from 'fs';
import path from 'path';

/**
 * Private helper function used to get the state from file
 * @param {Object} api - The Homebridge api
 * @param {String} id - Id of blind
 * @returns {Object} structured objected containing blind data
 */
function readStateFromFile(api, id) {
    const filename = path.join(api.user.storagePath(), `${id}.json`);
    let state;

    if (!fs.existsSync(filename)) {
        // Return initial state 
        state = {
            "on": true,
            "rollingCode": 1
        };
    }
    else {
        state = JSON.parse(fs.readFileSync(filename));

        if (isNaN(parseInt(state.rollingCode))) {
            throw `No valid rolling code in file ./${this.id}.txt`;
        }
    }

    return state;
}

/**
 * Private helper function used to set the state in file
 * @param {Object} api - The Homebridge api
 * @param {String} id - Id of blind
 * @returns {Object} structured objected containing blind data
 */
 function writeStateToFile(api, id, state) {
    const filename = path.join(api.user.storagePath(), `${id}.json`);
    const toWrite = JSON.stringify(state, null, 4);

    fs.writeFileSync(filename, toWrite, (err) => {
        if (err) throw err;
    });
}

/**
 * Handle requests to get the current value of the "On" characteristic
 * @method getOn
 * @param {Object} api - The Homebridge api
 * @param {String} id - Id of blind
 * @returns {Boolean} - true = blind closed; false = blind open
 */
export function getOn(api, id) {
    if (!id) throw('No id passed to function');

    let state = readStateFromFile(api, id);

    return state.on;
}

/**
 * Set the current value of the "On" characteristic
 * @method setOn
 * @param {Object} api - The Homebridge api
 * @param {String} id - Id of blind
 * @param {String} value - Value to set
 * @returns {Boolean} - true = blind closed; false = blind open
 */
export function setOn(api, id, value) {
    if (!id) throw('No id passed to function');

    let state = readStateFromFile(api, id);

    // Update value
    state["on"] = !!value;

    writeStateToFile(api, id, state);
}

/**
 * Handle requests to get the current value of the "On" characteristic
 * @method getRollingCode
 * @param {Object} api - The Homebridge api
 * @param {String} id - Id of blind
 * @returns {Integer} - Value of the current rolling code
 */
 export function getRollingCode(api, id) {
    if (!id) throw('No id passed to function');

    let state = readStateFromFile(api, id);

    return state.rollingCode;
}

/**
 * Set the current value of the "On" characteristic
 * @method advanceRollingCode
 * @param {Object} api - The Homebridge api
 * @param {String} id - Id of blind
 * @returns {Integer} - Value of the new rolling code
 */
 export function advanceRollingCode(api, id) {
    if (!id) throw('No id passed to function');

    let state = readStateFromFile(api, id);

    // Advance code
    state.rollingCode++;

    // Write to file
    writeStateToFile(api, id, state);

    return state.rollingCode;
}