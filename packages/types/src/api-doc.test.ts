import { describe, expect, test } from "bun:test";
import vmathDoc from "../fixtures/vmath_doc.json" with { type: "json" };
import { type ApiFunction, type ApiModule, parseDefoldApiDoc } from "./api-doc";

describe("parseDefoldApiDoc", () => {
  test("parses the vmath fixture and exposes the namespace", () => {
    const module: ApiModule = parseDefoldApiDoc(vmathDoc);
    expect(module.namespace).toBe("vmath");
  });

  test("includes the expected core vmath function names", () => {
    const module = parseDefoldApiDoc(vmathDoc);
    const names = new Set(module.functions.map((fn) => fn.name));
    for (const expected of [
      "vmath.vector3",
      "vmath.vector4",
      "vmath.quat",
      "vmath.dot",
      "vmath.cross",
      "vmath.length",
      "vmath.normalize",
    ]) {
      expect(names.has(expected)).toBe(true);
    }
  });

  test("vmath.vector3(x, y, z) has three numeric params and returns vector3", () => {
    const module = parseDefoldApiDoc(vmathDoc);
    const overload = module.functions.find(
      (fn): fn is ApiFunction =>
        fn.name === "vmath.vector3" &&
        fn.parameters.length === 3 &&
        fn.parameters.every((p) => p.types.includes("number")),
    );
    expect(overload).toBeDefined();
    if (!overload) return;
    expect(overload.parameters.map((p) => p.name)).toEqual(["x", "y", "z"]);
    expect(overload.returnValues).toHaveLength(1);
    expect(overload.returnValues[0]?.types).toContain("vector3");
  });

  test("rejects non-Defold-api inputs with a field-naming error", () => {
    expect(() => parseDefoldApiDoc(null)).toThrow(/object/i);
    expect(() => parseDefoldApiDoc({})).toThrow(/info/);
    expect(() => parseDefoldApiDoc({ info: null })).toThrow(/info/);
    expect(() => parseDefoldApiDoc({ info: { name: "x" } })).toThrow(/namespace/);
  });

  test("every parsed ApiFunction has non-undefined name/parameters/returnValues", () => {
    const module = parseDefoldApiDoc(vmathDoc);
    expect(module.functions.length).toBeGreaterThan(0);
    for (const fn of module.functions) {
      expect(typeof fn.name).toBe("string");
      expect(fn.name.length).toBeGreaterThan(0);
      expect(Array.isArray(fn.parameters)).toBe(true);
      expect(Array.isArray(fn.returnValues)).toBe(true);
    }
  });
});
