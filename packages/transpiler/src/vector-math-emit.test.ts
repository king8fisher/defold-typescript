import { describe, expect, test } from "bun:test";
import { transpile } from "./transpile";

describe("vector math operator emit", () => {
  test("v.add(other) emits native Lua + (no userland helper)", () => {
    const source = [
      "export function go() {",
      "  const a = vmath.vector3(1, 2, 3);",
      "  const b = vmath.vector3(4, 5, 6);",
      "  return a.add(b);",
      "}",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toMatchSnapshot();
    expect(result.lua).toContain("a + b");
    expect(result.lua).not.toContain(":add");
    expect(result.lua).not.toContain(".add(");
  });

  test("v.sub(other) emits Lua -", () => {
    const source = [
      "export function go() {",
      "  const a = vmath.vector3(1, 2, 3);",
      "  const b = vmath.vector3(4, 5, 6);",
      "  return a.sub(b);",
      "}",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toContain("a - b");
  });

  test("v.mul(scalar) emits Lua *", () => {
    const source = [
      "export function go() {",
      "  const a = vmath.vector3(1, 2, 3);",
      "  return a.mul(2);",
      "}",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toContain("a * 2");
  });

  test("v.div(scalar) emits Lua /", () => {
    const source = [
      "export function go() {",
      "  const a = vmath.vector3(2, 4, 6);",
      "  return a.div(2);",
      "}",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toContain("a / 2");
  });

  test("v.unm() emits Lua unary minus", () => {
    const source = [
      "export function go() {",
      "  const a = vmath.vector3(1, 2, 3);",
      "  return a.unm();",
      "}",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toMatchSnapshot();
    expect(result.lua).toMatch(/-a\b/);
  });

  test("m.mul(v4) emits Lua *", () => {
    const source = [
      "export function go() {",
      "  const m = vmath.matrix4();",
      "  const v = vmath.vector4(1, 2, 3, 4);",
      "  return m.mul(v);",
      "}",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toMatchSnapshot();
    expect(result.lua).toContain("m * v");
  });
});
