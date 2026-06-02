import { describe, expect, test } from "bun:test";
import { defineGuiScript, defineRenderScript, defineScript } from "./lifecycle";

describe("defineScript", () => {
  test("returns the hooks object by identity (no wrapping)", () => {
    const hooks = {
      init() {},
      update() {},
    };
    expect(defineScript<{ counter: number }>(hooks)).toBe(hooks);
  });

  test("accepts an empty hooks object", () => {
    const hooks = {};
    expect(defineScript<Record<string, never>>(hooks)).toBe(hooks);
  });
});

describe("defineGuiScript", () => {
  test("returns the hooks object by identity (no wrapping)", () => {
    const hooks = {
      init() {},
      update() {},
    };
    expect(defineGuiScript<{ counter: number }>(hooks)).toBe(hooks);
  });
});

describe("defineRenderScript", () => {
  test("returns the hooks object by identity (no wrapping)", () => {
    const hooks = {
      init() {},
      update() {},
    };
    expect(defineRenderScript<{ counter: number }>(hooks)).toBe(hooks);
  });
});
