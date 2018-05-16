// @flow

class Warning {
    name: string;
    message: string;
    stack: string;

    constructor(message: string) {
        // $FlowFixMe
        this.name = "Warning";
        // $FlowFixMe
        this.message = "Warning: " + message;
        // $FlowFixMe
        this.stack = new Error().stack;
    }
}
// $FlowFixMe
Warning.prototype = Object.create(Error.prototype);

module.exports = Warning;
