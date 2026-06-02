import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { CURRENT_STABLE_SURFACE_ID, selectApiSurface } from "./api-surface";
import { CURRENT_STABLE_DEFOLD_VERSION } from "./defold-version";

describe("selectApiSurface", () => {
  test("CURRENT_STABLE_SURFACE_ID is the absolute-versioned default id", () => {
    expect(CURRENT_STABLE_SURFACE_ID).toBe("defold-1.12.4");
  });

  test("current-stable version maps to the default surface", () => {
    expect(selectApiSurface(CURRENT_STABLE_DEFOLD_VERSION)).toEqual({
      surfaceId: CURRENT_STABLE_SURFACE_ID,
      available: true,
    });
  });

  test("an unknown version has no pre-baked surface", () => {
    expect(selectApiSurface("1.10.0")).toEqual({
      surfaceId: null,
      available: false,
    });
  });

  test("a bare-semver pin maps to its ref-doc registry target", () => {
    expect(selectApiSurface("1.9.8")).toEqual({
      surfaceId: "defold-1.9.8",
      available: true,
    });
  });

  test("a version with no matching target is unavailable", () => {
    expect(selectApiSurface("0.0.0")).toEqual({
      surfaceId: null,
      available: false,
    });
  });
});

describe("drift guard", () => {
  test("CURRENT_STABLE_SURFACE_ID equals the default target id in api-targets.json", () => {
    const registryPath = path.resolve(import.meta.dir, "../../types/api-targets.json");
    const registry = JSON.parse(readFileSync(registryPath, "utf8")) as {
      targets: { id: string; default?: boolean }[];
    };
    const defaults = registry.targets.filter((t) => t.default === true);
    expect(defaults).toHaveLength(1);
    expect(defaults[0]?.id).toBe(CURRENT_STABLE_SURFACE_ID);
  });
});
