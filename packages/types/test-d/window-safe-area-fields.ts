/// <reference path="../index.d.ts" />

const _inset_top: number = window.get_safe_area().safe_area.inset_top;
void _inset_top;

// @ts-expect-error not_a_key is not a recovered field of the nested safe_area table
const _bad = window.get_safe_area().safe_area.not_a_key;
void _bad;
