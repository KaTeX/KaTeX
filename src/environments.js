// @flow
import {_environments} from "./defineEnvironment";

const environments = {
    has(envName: string) {
        return _environments.hasOwnProperty(envName);
    },
    get(envName: string) {
        return _environments[envName];
    },
};

export {environments as default};

// All environment definitions should be imported below
import "./environments/array.js";
