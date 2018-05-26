// @flow

import ParseError from "./ParseError";

export type Mapping<Value> = {[string]: Value};

export default class Namespace<Value> {
    current: Mapping<Value>;
    builtins: Mapping<Value>;
    undefStack: Mapping<Value>[];

    /**
     * Both arguments are optional.  The first argument is an object of built-in
     * mappings which never change.  The second argument is an object of initial
     * mappings, which will constantly change according to any `set`s done.
     */
    constructor(builtins: Mapping<Value> = {}, topGroup: Mapping<Value> = {}) {
        this.current = topGroup;
        this.builtins = builtins;
        this.undefStack = [];
    }

    beginGroup() {
        this.undefStack.push({});
    }

    endGroup() {
        if (this.undefStack.length === 0) {
            throw new ParseError("Unbalanced namespace destruction: attempt " +
                "to pop global namespace; please report this as a bug");
        }
        const undefs = this.undefStack.pop();
        for (const undef of Object.getOwnPropertyNames(undefs)) {
            if (undefs[undef] === undefined) {
                delete this.current[undef];
            } else {
                this.current[undef] = undefs[undef];
            }
        }
    }

    get(name: string): ?Value {
        if (this.current.hasOwnProperty(name)) {
            return this.current[name];
        } else {
            return this.builtins[name];
        }
    }

    set(name: string, value: Value, global: boolean = false) {
        if (global) {
            // Global set is equivalent to setting in all groups.  Simulate this
            // by destroying any undoes currently scheduled for this name,
            // and adding an undo with the *new* value (in case it later gets
            // locally reset within this environment).
            for (let i = 0; i < this.undefStack.length; i++) {
                delete this.undefStack[i][name];
            }
            if (this.undefStack.length > 0) {
                this.undefStack[this.undefStack.length - 1][name] = value;
            }
        } else {
            // Undo this set at end of this group (possibly to `undefined`),
            // unless an undo is already in place, in which case that older
            // value is the correct one.
            const top = this.undefStack[this.undefStack.length - 1];
            if (top && !top.hasOwnProperty(name)) {
                top[name] = this.current[name];
            }
        }
        this.current[name] = value;
    }
}
