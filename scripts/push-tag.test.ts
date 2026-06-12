import { describe, expect, test } from "bun:test";
import { isVersion, parseArgs } from "./push-tag.ts";

describe("parseArgs", () => {
  test("reads a single version argument", () => {
    expect(parseArgs(["0.2.0"])).toEqual({ version: "0.2.0", help: false });
  });

  test("defaults to no version", () => {
    expect(parseArgs([])).toEqual({ version: null, help: false });
  });

  test("recognizes --help and -h", () => {
    expect(parseArgs(["--help"]).help).toBe(true);
    expect(parseArgs(["-h"]).help).toBe(true);
  });

  test("rejects unknown flags and extra positionals", () => {
    expect(() => parseArgs(["--nope"])).toThrow(/unknown flag/);
    expect(() => parseArgs(["0.2.0", "0.3.0"])).toThrow(/single <version>/);
  });
});

describe("isVersion", () => {
  test("accepts plain x.y.z", () => {
    expect(isVersion("0.2.0")).toBe(true);
    expect(isVersion("10.20.30")).toBe(true);
  });

  test("rejects partial, prefixed, or prerelease versions", () => {
    expect(isVersion("1.2")).toBe(false);
    expect(isVersion("v1.2.3")).toBe(false);
    expect(isVersion("1.2.3-rc1")).toBe(false);
  });
});
