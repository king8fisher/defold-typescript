import { describe, expect, test } from "bun:test";
import { transpileProject } from "./transpile";

const IMPORT =
  'import { clearInterval, clearTimeout, setInterval, setTimeout, wait } from "@defold-typescript/types/timers";';

describe("timers lowering", () => {
  test("lowers the timers import to a flat require with no diagnostics", () => {
    const result = transpileProject({
      files: {
        "main.ts": [
          IMPORT,
          "const h = setTimeout(() => print(1), 250);",
          "clearTimeout(h);",
          "",
        ].join("\n"),
      },
    });
    expect(result.diagnostics).toEqual([]);
    const lua = result.lua["main.ts"] ?? "";
    expect(lua).toContain('require("defold_typescript_timers")');
    // The dotted package specifier must not survive into the emitted require.
    expect(lua).not.toContain("@defold-typescript");
  });

  test("surfaces the runtime only when the module is imported (pay-for-use)", () => {
    const imported = transpileProject({
      files: { "main.ts": [IMPORT, "setInterval(() => print(1), 1000);", ""].join("\n") },
    });
    expect(imported.timersRuntime).toBeDefined();
    expect(imported.timersRuntime).toContain("timer.delay");
    expect(imported.timersRuntime).toContain("timer.cancel");

    const untouched = transpileProject({ files: { "main.ts": "export const x = 1;\n" } });
    expect(untouched.timersRuntime).toBeUndefined();
  });

  test("wait builds its Promise around a timer.delay callback that resolves", () => {
    const result = transpileProject({
      files: {
        "main.ts": [
          'import { wait } from "@defold-typescript/types/timers";',
          "export async function main(): Promise<void> {",
          "  await wait(0);",
          "}",
          "",
        ].join("\n"),
      },
    });
    expect(result.diagnostics).toEqual([]);
    const runtime = result.timersRuntime ?? "";
    expect(runtime).toContain("__TS__Promise");
    expect(runtime).toContain("timer.delay");
    expect(runtime).toContain("resolve");
  });
});
