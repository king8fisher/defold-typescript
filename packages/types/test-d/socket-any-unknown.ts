/// <reference path="../index.d.ts" />

// Where Defold's ref-doc types a value as the bare `any` wildcard, the slot is
// `unknown`: it accepts any value going in and must be narrowed coming out.

// Wildcard parameter slots accept assorted value kinds.
const [first] = socket.skip(1, "a string", 42, { tabled: true });

// @ts-expect-error a wildcard return is `unknown`, not directly usable as a number
const _bad: number = first;

// Narrow at the point of use, exactly as with any other `unknown`.
const _ok: number = first as number;
void _ok;
