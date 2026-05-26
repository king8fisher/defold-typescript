export interface Vector {
  readonly [index: number]: number;
  readonly length: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Matrix4 {
  m00: number;
  m01: number;
  m02: number;
  m03: number;
  m10: number;
  m11: number;
  m12: number;
  m13: number;
  m20: number;
  m21: number;
  m22: number;
  m23: number;
  m30: number;
  m31: number;
  m32: number;
  m33: number;
  c0: Vector4;
  c1: Vector4;
  c2: Vector4;
  c3: Vector4;
}

declare const HashBrand: unique symbol;
export interface Hash {
  readonly [HashBrand]: "Hash";
}

export interface Url {
  readonly socket: Hash;
  readonly path: Hash;
  readonly fragment: Hash | undefined;
}

export const DEFOLD_TYPE_MAP: Readonly<Record<string, string>> = {
  number: "number",
  string: "string",
  boolean: "boolean",
  table: "Record<string | number, unknown>",
  function: "(...args: unknown[]) => unknown",
  vector: "Vector",
  vector3: "Vector3",
  vector4: "Vector4",
  quaternion: "Quaternion",
  matrix4: "Matrix4",
  hash: "Hash",
  url: "Url",
} as const;
