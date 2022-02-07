const LOGGING_ON = false;

class SwitchServiceMock {
    constructor(buttonName, button) {
        this.buttonName = buttonName;
        this.button = button;
        this.methods = [];
    }

    getCharacteristic(characteristic) {
        return this;
    }

    updateCharacteristic(characteristic, value) {
        return this;
    }

    onGet(f) {
        this.getMethod = f;

        return this;
    }

    onSet(f) {
        this.setMethod = f;

        return this;
    }

    get() {
        return this.getMethod();
    }

    set(value) {
        return this.setMethod(value);
    }
}

class WindowCoveringMock {
    constructor(buttonName) {
        this.buttonName = buttonName;
        this.methods = [];
    }

    getCharacteristic(characteristic) {
        return this;
    }

    updateCharacteristic(characteristic, value) {
        return this;
    }

    onGet(f) {
        this.getMethod = f;

        return this;
    }

    setProps(props) {
        return this;
    }

    onSet(f) {
        this.setMethod = f;

        return this;
    }

    get() {
        return this.getMethod();
    }

    set(value) {
        return this.setMethod(value);
    }
}

// Mock the Logger for Homebridge
let log = {
    debug: function(text) { if (LOGGING_ON) console.log(text); }
}


let api = {
    'hap': {
        'Characteristic': {
            'On': 1
        },
        'Service': {
            'Switch': SwitchServiceMock,
            'WindowCovering': WindowCoveringMock
        }
    }
};

export {
    api,
    log
}