// @flow

import builtinMacros from "./macros";
import type {MacroMap, MacroExpansion} from "./macros";

export default class Namespace {
    parent: ?Namespace;
    macros: MacroMap;
    //tag: any;

    constructor(parent: ?Namespace, macros: MacroMap = {}) {
        this.parent = parent;
        this.macros = macros;
    }

    getMacro(name: string): ?MacroExpansion {
        let ns = this;
        while (ns && !ns.macros.hasOwnProperty(name)) {
            ns = ns.parent;
        }
        if (ns) {
            return ns.macros[name];
        } else if (builtinNamespace.macros.hasOwnProperty(name)) {
            return builtinNamespace.macros[name];
        } else {
            return null;
        }
    }

    setMacro(name: string, expansion: MacroExpansion, global: Boolean = false) {
        // Global set is equivalent to setting in all namespaces up the stack.
        if (global) {
            let namespace = this;
            while (namespace) {
                namespace.macros[name] = expansion;
                namespace = namespace.parent;
            }
        } else {
            this.macros[name] = expansion;
        }
    }
}

export const builtinNamespace = new Namespace(undefined, builtinMacros);
