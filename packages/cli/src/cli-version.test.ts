import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { readCliVersion } from "./cli-version";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(os.tmpdir(), "defold-typescript-cli-version-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("readCliVersion", () => {
  test("returns the version field from <dir>/package.json", () => {
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({ version: "9.9.9" }));

    expect(readCliVersion(dir)).toBe("9.9.9");
  });

  test("falls back to 0.0.0 when package.json is missing", () => {
    expect(readCliVersion(dir)).toBe("0.0.0");
  });

  test("falls back to 0.0.0 when package.json is malformed", () => {
    writeFileSync(path.join(dir, "package.json"), "{ not valid json");

    expect(readCliVersion(dir)).toBe("0.0.0");
  });
});
