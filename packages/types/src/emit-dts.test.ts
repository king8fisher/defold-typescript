import { describe, expect, test } from "bun:test";
import vmathDoc from "../fixtures/vmath_doc.json" with { type: "json" };
import { type ApiModule, parseDefoldApiDoc } from "./api-doc";
import { emitDeclarations } from "./emit-dts";

describe("emitDeclarations", () => {
  test("empty module emits a bare namespace block with a trailing newline", () => {
    const empty: ApiModule = {
      namespace: "foo",
      brief: "",
      description: "",
      functions: [],
      variables: [],
    };
    expect(emitDeclarations(empty)).toBe("declare namespace foo {\n}\n");
  });

  test("vmath emit contains the namespace header and key signatures", () => {
    const module = parseDefoldApiDoc(vmathDoc);
    const out = emitDeclarations(module);
    expect(out).toContain("declare namespace vmath {");
    expect(out).toContain("function vector3(): Vector3;");
    expect(out).toContain("function vector3(x: number, y: number, z: number): Vector3;");
    // vmath.dot accepts vector3 or vector4 — union types are the natural emission.
    expect(out).toContain("function dot(v1: Vector3 | Vector4, v2: Vector3 | Vector4): number;");
  });

  test("multi-type parameter emits a TypeScript union", () => {
    const module: ApiModule = {
      namespace: "thing",
      brief: "",
      description: "",
      functions: [
        {
          name: "thing.takes",
          brief: "",
          description: "",
          parameters: [{ name: "v", doc: "", types: ["number", "vector3"] }],
          returnValues: [],
        },
      ],
      variables: [],
    };
    expect(emitDeclarations(module)).toContain("function takes(v: number | Vector3): void;");
  });

  test("unknown Defold type token falls through to unknown without throwing", () => {
    const module: ApiModule = {
      namespace: "thing",
      brief: "",
      description: "",
      functions: [
        {
          name: "thing.weird",
          brief: "",
          description: "",
          parameters: [{ name: "x", doc: "", types: ["frobnicator"] }],
          returnValues: [{ name: "", doc: "", types: ["frobnicator"] }],
        },
      ],
      variables: [],
    };
    const out = emitDeclarations(module);
    expect(out).toContain("function weird(x: unknown): unknown;");
  });

  test("variables emit as const declarations inside the namespace", () => {
    const module: ApiModule = {
      namespace: "thing",
      brief: "",
      description: "",
      functions: [],
      variables: [{ name: "thing.PI", brief: "", description: "", types: ["number"] }],
    };
    expect(emitDeclarations(module)).toContain("const PI: number;");
  });

  test("vmath emit matches the committed snapshot", () => {
    const module = parseDefoldApiDoc(vmathDoc);
    const out = emitDeclarations(module);
    expect(out).toMatchSnapshot();
  });
});
