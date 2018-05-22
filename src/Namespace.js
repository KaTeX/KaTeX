// @flow

import builtinMacros from "./macros";
import type {MacroMap, MacroExpansion} from "./macros";

export default class Namespace {
    parent: ?Namespace;
    global: Namespace;
    macros: MacroMap;
    //tag: any;

    constructor(parent: ?Namespace, macros: MacroMap = {}) {
        if (parent) {
            // Nonglobal namespace inherits from given parent
            this.parent = parent;
            this.global = parent.global;
        } else {
            // Global namespace inherits from builtin namespace,
            // but global pointer is to itself (so as not to modify builtins).
            this.parent = builtinNamespace;
            this.global = this;
        }

        this.macros = macros;
    }

    getMacro(name: string): ?MacroExpansion {
        let ns = this;
        while (ns && !ns.macros.hasOwnProperty(name)) {
            ns = ns.parent;
        }
        if (ns) {
            return ns.macros[name];
        } else {
            return null;
        }
    }
}

export const builtinNamespace = new Namespace(undefined, builtinMacros);
