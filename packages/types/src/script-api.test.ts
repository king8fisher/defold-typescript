import { describe, expect, it } from "bun:test";
import { parse } from "yaml";
import { parseDefoldApiDoc } from "./api-doc";
import { emitDeclarations } from "./emit-dts";
import { parseScriptApi, type RefDoc, scriptApiToRefDoc } from "./script-api";

const SAMPLE = `
- name: demo
  type: table
  desc: A demo namespace.
  members:
  - name: greet
    type: function
    desc: Greet someone.
    parameters:
      - name: self
        type: object
        desc: the script self
      - name: who
        type: string
        desc: the name to greet
    returns:
      - name: message
        type: string
        desc: the greeting text
  - name: VERSION
    type: number
    desc: a module constant
`;

function refDoc(): RefDoc {
  return scriptApiToRefDoc(parse(SAMPLE));
}

describe("scriptApiToRefDoc", () => {
  it("uses the top-level table name as the namespace", () => {
    expect(refDoc().info.namespace).toBe("demo");
  });

  it("maps a function member to a FUNCTION element with a namespaced name", () => {
    const fns = refDoc().elements.filter((e) => e.type === "FUNCTION");
    expect(fns).toHaveLength(1);
    expect(fns[0]?.name).toBe("demo.greet");
  });

  it("lifts each parameter's singular type into a types array", () => {
    expect(refDoc().elements[0]?.parameters).toEqual([
      { name: "who", doc: "the name to greet", types: ["string"] },
    ]);
  });

  it("maps returns to returnvalues with the same singular-to-array lift", () => {
    expect(refDoc().elements[0]?.returnvalues).toEqual([
      { name: "message", doc: "the greeting text", types: ["string"] },
    ]);
  });

  it("drops a leading self parameter so the emitted function honors @noSelfInFile", () => {
    expect(refDoc().elements[0]?.parameters.some((p) => p.name === "self")).toBe(false);
  });

  it("drops scalar (constant) members", () => {
    const elements = refDoc().elements;
    expect(elements.every((e) => e.type === "FUNCTION")).toBe(true);
    expect(elements.some((e) => e.name === "demo.VERSION")).toBe(false);
  });

  it("round-trips through parseDefoldApiDoc and emitDeclarations", () => {
    const module = parseDefoldApiDoc(refDoc());
    expect(module.namespace).toBe("demo");
    expect(module.functions.map((f) => f.name)).toEqual(["demo.greet"]);
    const emitted = emitDeclarations(module);
    expect(emitted).toContain("function greet(who: string): string;");
  });

  it("parseScriptApi accepts raw YAML text", () => {
    expect(parseScriptApi(SAMPLE).info.namespace).toBe("demo");
  });
});
