/**
 * Small module for atom-group constants and type guard.  Kept separate from
 * `symbols.ts` so that consumers (notably `contrib/render-a11y-string`) can
 * pull in `isAtom` without dragging in the ~870-line symbol tables.
 */

const atomList = [
    "bin",
    "close",
    "inner",
    "open",
    "punct",
    "rel",
] as const;

const nonAtomList = [
    "accent-token",
    "mathord",
    "op-token",
    "spacing",
    "textord",
] as const;

const Atoms: ReadonlySet<string> = new Set(atomList);
export const NonAtoms: ReadonlySet<string> = new Set(nonAtomList);

export type Atom = typeof atomList[number];
type NonAtom = typeof nonAtomList[number];
export type Group = Atom | NonAtom;

export function isAtom(value: string): value is Atom {
    return Atoms.has(value);
}
