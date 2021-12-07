import * as fs from 'fs';

/**
 * Private helper function used to get the state from file
 * @param {String} id - Id of blind
 * @returns {Object} structured objected containing blind data
 */
function readStateFromFile(id) {
    const filename = `./${id}.json`;
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
 * @param {String} id - Id of blind
 * @returns {Object} structured objected containing blind data
 */
 function writeStateToFile(id, state) {
    const filename = `./${id}.json`;
    const toWrite = JSON.stringify(state, null, 4);

    fs.writeFileSync(filename, toWrite, (err) => {
        if (err) throw err;
    });
}

/**
 * Handle requests to get the current value of the "On" characteristic
 * @method getOn
 * @param {String} id - Id of blind
 * @returns {Boolean} - true = blind closed; false = blind open
 */
export function getOn(id) {
    let state = readStateFromFile(id);

    return state.on;
}

/**
 * Set the current value of the "On" characteristic
 * @method setOn
 * @param {String} id - Id of blind
 * @param {String} value - Value to set
 * @returns {Boolean} - true = blind closed; false = blind open
 */
export function setOn(id, value) {
    let state = readStateFromFile(id);

    // Update value
    state["on"] = value;

    writeStateToFile(id, state);
}

/**
 * Handle requests to get the current value of the "On" characteristic
 * @method getRollingCode
 * @param {String} id - Id of blind
 * @returns {Integer} - Value of the current rolling code
 */
 export function getRollingCode(id) {
    let state = readStateFromFile(id);

    return state.rollingCode;
}

/**
 * Set the current value of the "On" characteristic
 * @method advanceRollingCode
 * @param {String} id - Id of blind
 * @returns {Integer} - Value of the new rolling code
 */
 export function advanceRollingCode(id) {
    let state = readStateFromFile(id);

    // Advance code
    state.rollingCode++;

    // Write to file
    writeStateToFile(id, state);

    return state.rollingCode;
}