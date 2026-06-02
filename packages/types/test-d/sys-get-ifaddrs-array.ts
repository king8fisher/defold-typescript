/// <reference path="../index.d.ts" />

export {};

const _ifaddrs = sys.get_ifaddrs();
const [_first] = _ifaddrs;

const _name: string | undefined = _first?.name;
void _name;

const _up: boolean | undefined = _first?.up;
void _up;

// @ts-expect-error not_a_field is not a recovered field of the ifaddrs table
const _bad = _first?.not_a_field;
void _bad;
