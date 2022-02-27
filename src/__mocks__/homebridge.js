const LOGGING_ON = false;

const CHARACTERISTICS = {
    'On': 'ON',
    'CurrentPosition': 'CURRENTPOSITION',
    'TargetPosition': 'TARGETPOSITION',
    'PositionState': {
        DECREASING: 'DECREASING',
        INCREASING: 'INCREASING',
        STOPPED: 'STOPPED',
        toString: function() { return 'POSITIONSTATE'; }
    }
};

class MockCharacteristic {
    updateValue(value) {
        this.value = value;

        return this;
    }

    get() {
        return this.getMethod();
    }

    set(value) {
        this.value = value;

        return this.setMethod(value);
    }

    onGet(f) {
        this.getMethod = f;

        return this;
    }

    onSet(f) {
        this.setMethod = f;

        return this;
    }

    setProps(props) {
        this.props = props;
        
        return this;
    }
}

class SwitchServiceMock {
    constructor(buttonName, button) {
        this.buttonName = buttonName;
        this.button = button;

        this.characteristics = {
            'ON': new MockCharacteristic()
        };
    }

    getCharacteristic(characteristic) {
        return this.characteristics[characteristic];
    }

    updateCharacteristic(characteristic, value) {
        return this;
    }
}

class WindowCoveringMock {
    constructor(buttonName) {
        this.buttonName = buttonName;

        this.characteristics = {
            'CURRENTPOSITION': new MockCharacteristic(),
            'TARGETPOSITION': new MockCharacteristic(),
            'POSITIONSTATE': new MockCharacteristic()
        };
    }

    getCharacteristic(characteristic) {
        return this.characteristics[characteristic];
    }

    updateCharacteristic(characteristic, value) {
        return this;
    }
}

let api = {
    'hap': {
        'Characteristic': CHARACTERISTICS,
        'Service': {
            'Switch': SwitchServiceMock,
            'WindowCovering': WindowCoveringMock
        }
    }
};

// Mock the Logger for Homebridge
let log = {
    debug: function(text) { if (LOGGING_ON) console.log(text); }
}

export {
    api,
    log
}