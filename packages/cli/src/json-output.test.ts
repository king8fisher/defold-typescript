import { describe, expect, test } from "bun:test";
import { renderResult } from "./json-output";

describe("renderResult", () => {
  test("serializes a successful init result with written files", () => {
    const out = renderResult({ command: "init", written: ["a", "b"] });
    const parsed = JSON.parse(out) as Record<string, unknown>;
    expect(parsed).toEqual({ command: "init", ok: true, written: ["a", "b"] });
  });

  test("serializes a failing build result with an error and no written key", () => {
    const out = renderResult({ command: "build", error: "boom" });
    const parsed = JSON.parse(out) as Record<string, unknown>;
    expect(parsed).toEqual({ command: "build", ok: false, error: "boom" });
    expect("written" in parsed).toBe(false);
  });

  test("emits a single line terminated by a newline", () => {
    const out = renderResult({ command: "init", written: [] });
    expect(out.endsWith("\n")).toBe(true);
    expect(out.trimEnd()).not.toContain("\n");
  });

  test("includes a string apiSurface when present", () => {
    const out = renderResult({ command: "build", written: [], apiSurface: "defold-1.12.4" });
    const parsed = JSON.parse(out) as Record<string, unknown>;
    expect(parsed.apiSurface).toBe("defold-1.12.4");
  });

  test("emits an explicit null apiSurface when present", () => {
    const out = renderResult({ command: "build", written: [], apiSurface: null });
    const parsed = JSON.parse(out) as Record<string, unknown>;
    expect("apiSurface" in parsed).toBe(true);
    expect(parsed.apiSurface).toBeNull();
  });

  test("omits apiSurface when undefined", () => {
    const out = renderResult({ command: "build", written: [] });
    const parsed = JSON.parse(out) as Record<string, unknown>;
    expect("apiSurface" in parsed).toBe(false);
  });

  test("includes scriptKind when present", () => {
    const out = renderResult({ command: "init", written: [], scriptKind: "gui-script" });
    const parsed = JSON.parse(out) as Record<string, unknown>;
    expect(parsed.scriptKind).toBe("gui-script");
  });

  test("emits an explicit null scriptKind when present", () => {
    const out = renderResult({ command: "init", written: [], scriptKind: null });
    const parsed = JSON.parse(out) as Record<string, unknown>;
    expect("scriptKind" in parsed).toBe(true);
    expect(parsed.scriptKind).toBeNull();
  });

  test("omits scriptKind when undefined", () => {
    const out = renderResult({ command: "init", written: [] });
    const parsed = JSON.parse(out) as Record<string, unknown>;
    expect("scriptKind" in parsed).toBe(false);
  });
});
