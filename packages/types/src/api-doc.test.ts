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

  test("collects CONSTANT elements into constants (fully qualified) and excludes PROPERTY", () => {
    const doc = {
      info: { namespace: "ns" },
      elements: [
        { type: "CONSTANT", name: "ns.FOO", brief: "foo brief", description: "foo desc" },
        { type: "PROPERTY", name: "ns.some_property" },
        { type: "VARIABLE", name: "ns.PI", types: ["number"] },
      ],
    };
    const module = parseDefoldApiDoc(doc);
    expect(module.constants.map((c) => c.name)).toEqual(["ns.FOO"]);
    expect(module.constants[0]?.brief).toBe("foo brief");
    expect(module.variables.map((v) => v.name)).toEqual(["ns.PI"]);
  });

  test("sets isOptional from the doc's is_optional flag, leaving name/types unchanged", () => {
    const doc = {
      info: { namespace: "ns" },
      elements: [
        {
          type: "FUNCTION",
          name: "ns.fn",
          parameters: [
            { name: "a", types: ["number"], is_optional: "True" },
            { name: "b", types: ["string"], is_optional: "False" },
            { name: "c", types: ["number"] },
          ],
          returnvalues: [],
        },
      ],
    };
    const fn = parseDefoldApiDoc(doc).functions[0];
    expect(fn).toBeDefined();
    if (!fn) return;
    expect(fn.parameters.map((p) => p.name)).toEqual(["a", "b", "c"]);
    expect(fn.parameters.map((p) => p.types)).toEqual([["number"], ["string"], ["number"]]);
    expect(fn.parameters.map((p) => p.isOptional)).toEqual([true, false, false]);
  });

  test("collects PROPERTY elements into properties with name + types parsed from the brief span", () => {
    const doc = {
      info: { namespace: "ns" },
      elements: [
        {
          type: "PROPERTY",
          name: "color",
          brief: '<span class="type">vector4</span> ns color',
        },
        {
          type: "PROPERTY",
          name: "scale",
          brief: '<span class="type">number | vector3</span> ns scale',
        },
        { type: "MESSAGE", name: "ns.some_message" },
        { type: "TYPEDEF", name: "ns.some_typedef" },
      ],
    };
    const module = parseDefoldApiDoc(doc);
    expect(module.properties.map((p) => p.name)).toEqual(["color", "scale"]);
    expect(module.properties[0]?.types).toEqual(["vector4"]);
    expect(module.properties[1]?.types).toEqual(["number", "vector3"]);
  });

  test("collects TYPEDEF elements into typedefs (name preserved) and excludes MESSAGE", () => {
    const doc = {
      info: { namespace: "render" },
      elements: [
        { type: "TYPEDEF", name: "render_target", brief: "Render target" },
        { type: "TYPEDEF", name: "constant_buffer", brief: "Constant buffer" },
        { type: "MESSAGE", name: "render.some_message" },
      ],
    };
    const module = parseDefoldApiDoc(doc);
    expect(module.typedefs.map((t) => t.name)).toEqual(["render_target", "constant_buffer"]);
  });

  test("a PROPERTY with no type span parses to an empty types array", () => {
    const doc = {
      info: { namespace: "ns" },
      elements: [{ type: "PROPERTY", name: "mystery" }],
    };
    const module = parseDefoldApiDoc(doc);
    expect(module.properties).toHaveLength(1);
    expect(module.properties[0]?.types).toEqual([]);
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
