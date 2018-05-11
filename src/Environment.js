// @flow

import builtinMacros from "./macros";
import type {MacroMap, MacroExpansion} from "./macros";

export default class Environment {
    parent: ?Environment;
    global: Environment;
    macros: MacroMap;
    //tag: any;

    constructor(parent: ?Environment = null, macros: MacroMap = {}) {
        this.parent = parent;
        // Both the builtinEnvironment and any children environments are
        // treated as global environments, i.e., global points to themselves.
        // All descendant environments will point to the nearest ancestor
        // global environment.
        if (!parent || parent === builtinEnvironment) {
            this.global = this;
        } else {
            this.global = parent.global;
        }
        this.macros = macros;
    }

    getMacro(name: string): ?MacroExpansion {
        let env = this;
        while (env && !env.macros.hasOwnProperty(name)) {
            env = env.parent;
        }
        if (env) {
            return env.macros[name];
        } else {
            return null;
        }
    }
}

export const builtinEnvironment = new Environment(null, builtinMacros);
