/// <reference path="../index.d.ts" />
import type { Vector3, Vector4 } from "../src/core-types";

const _v: Vector3 = vmath.vector3(1, 2, 3);
const _v0: Vector3 = vmath.vector3();
const _n: number = vmath.dot(_v, _v);
const _v4: Vector4 = vmath.vector4(1, 2, 3, 4);

// @ts-expect-error vmath.vector3 does not accept strings
vmath.vector3("not a number");

// @ts-expect-error vmath.dot returns number, not string
const _bad: string = vmath.dot(_v, _v);

void _v0;
void _n;
void _v4;
void _bad;
