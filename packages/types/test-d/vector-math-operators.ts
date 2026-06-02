/// <reference path="../index.d.ts" />
import type { Matrix4, Quaternion, Vector3, Vector4 } from "../src/core-types";

declare const v3a: Vector3;
declare const v3b: Vector3;
declare const v4a: Vector4;
declare const v4b: Vector4;
declare const q: Quaternion;
declare const m: Matrix4;
declare const n: number;

const _v3sumM: Vector3 = v3a.add(v3b);
const _v3subM: Vector3 = v3a.sub(v3b);
const _v3mulM: Vector3 = v3a.mul(n);
const _v3divM: Vector3 = v3a.div(n);
const _v3unmM: Vector3 = v3a.unm();

// @ts-expect-error Vector3.add result is Vector3, not number
const _v3addBadResult: number = v3a.add(v3b);
// @ts-expect-error Vector3.add requires a Vector3, not a number
const _v3addBad: Vector3 = v3a.add(n);
// @ts-expect-error Vector3.mul takes a number scalar, not another Vector3
const _v3mulBad: Vector3 = v3a.mul(v3b);

const _v4sumM: Vector4 = v4a.add(v4b);
const _v4subM: Vector4 = v4a.sub(v4b);
const _v4mulM: Vector4 = v4a.mul(n);
const _v4divM: Vector4 = v4a.div(n);
const _v4unmM: Vector4 = v4a.unm();

// @ts-expect-error Vector4.mul takes number, not Vector4
const _v4mulBad: Vector4 = v4a.mul(v4b);

const _qmulM: Quaternion = q.mul(q);
const _mmulmM: Matrix4 = m.mul(m);
const _mmulvM: Vector4 = m.mul(v4a);

// @ts-expect-error Matrix4.mul does not accept Vector3
const _mmulv3Bad: Vector4 = m.mul(v3a);

// Infix arithmetic on vector types must remain a type error — the toolchain
// requires the method form (a.add(b)). TS already rejects binary +, -, *, /
// on non-number operands (TS2362/TS2365); these @ts-expect-error markers
// pin that behavior so a future change to `core-types.ts` (e.g. extending
// from number) cannot silently re-introduce the `number` inference.
// (Unary minus is excluded: TypeScript does not flag `-objectValue` and
// silently produces `number` — a TS gotcha we cannot block at the type
// level. The method form `v.unm()` is the only typed alternative.)

// @ts-expect-error Vector3 + Vector3 must not type-check
const _v3plusV3 = v3a + v3b;
// @ts-expect-error Vector3 - Vector3 must not type-check
const _v3minusV3 = v3a - v3b;
// @ts-expect-error Vector3 * number must not type-check
const _v3timesN = v3a * n;
// @ts-expect-error number * Vector3 must not type-check
const _nTimesV3 = n * v3a;
// @ts-expect-error Vector3 / number must not type-check
const _v3divN = v3a / n;

// @ts-expect-error Vector4 + Vector4 must not type-check
const _v4plusV4 = v4a + v4b;
// @ts-expect-error Vector4 - Vector4 must not type-check
const _v4minusV4 = v4a - v4b;
// @ts-expect-error Vector4 * number must not type-check
const _v4timesN = v4a * n;
// @ts-expect-error number * Vector4 must not type-check
const _nTimesV4 = n * v4a;
// @ts-expect-error Vector4 / number must not type-check
const _v4divN = v4a / n;

// @ts-expect-error Quaternion * Quaternion must not type-check
const _qTimesQ = q * q;
// @ts-expect-error Matrix4 * Matrix4 must not type-check
const _mTimesM = m * m;
// @ts-expect-error Matrix4 * Vector4 must not type-check
const _mTimesV4 = m * v4a;

void _v3sumM;
void _v3subM;
void _v3mulM;
void _v3divM;
void _v3unmM;
void _v3addBadResult;
void _v3addBad;
void _v3mulBad;
void _v4sumM;
void _v4subM;
void _v4mulM;
void _v4divM;
void _v4unmM;
void _v4mulBad;
void _qmulM;
void _mmulmM;
void _mmulvM;
void _mmulv3Bad;
void _v3plusV3;
void _v3minusV3;
void _v3timesN;
void _nTimesV3;
void _v3divN;
void _v4plusV4;
void _v4minusV4;
void _v4timesN;
void _nTimesV4;
void _v4divN;
void _qTimesQ;
void _mTimesM;
void _mTimesV4;
