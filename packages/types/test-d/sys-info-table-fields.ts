/// <reference path="../index.d.ts" />

const _name: string = sys.get_sys_info().system_name;
void _name;

// @ts-expect-error not_a_field is not a recovered field of the sys info table
const _bad = sys.get_sys_info().not_a_field;
void _bad;
