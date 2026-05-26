/// <reference path="../index.d.ts" />
import type { Url, Vector3, Vector4 } from "../src/core-types";

const _v: Vector3 = vmath.vector3(1, 2, 3);
const _v0: Vector3 = vmath.vector3();
const _n: number = vmath.dot(_v, _v);
const _v4: Vector4 = vmath.vector4(1, 2, 3, 4);

// @ts-expect-error vmath.vector3 does not accept strings
vmath.vector3("not a number");

// @ts-expect-error vmath.dot returns number, not string
const _bad: string = vmath.dot(_v, _v);

const _u: Url = msg.url();
const _u2: Url = msg.url("main:/go#script");
msg.post(_u, "increment_score");
msg.post(_u, "increment_score", { amount: 10 });

// @ts-expect-error msg.post receiver must be Url-shaped, not number
msg.post(123, "x");

// @ts-expect-error msg.url returns Url, not string
const _badUrl: string = msg.url();

void _v0;
void _n;
void _v4;
void _bad;
void _u;
void _u2;
void _badUrl;
