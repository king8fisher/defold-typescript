import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "..");
const exampleDir = join(repoRoot, "docs/examples/platformer");

describe("platformer example bridge", () => {
  test("player.collection runs the emitted /src/player.ts.script", () => {
    const collection = readFileSync(join(exampleDir, "game/player.collection"), "utf8");
    expect(collection).toContain("/src/player.ts.script");
    expect(collection).not.toContain("/game/player.script");
  });

  test("the hand-written game/player.script is gone", () => {
    expect(existsSync(join(exampleDir, "game/player.script"))).toBe(false);
  });

  test(".gitignore ignores the emitted .ts.script build output", () => {
    const gitignore = readFileSync(join(exampleDir, ".gitignore"), "utf8");
    expect(gitignore).toContain("/src/*.ts.script");
    expect(gitignore).toContain("/src/*.ts.script.map");
    expect(gitignore).not.toContain("/src/*.lua");
  });
});
