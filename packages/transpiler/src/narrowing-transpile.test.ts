import { describe, expect, test } from "bun:test";
import { transpile } from "./transpile";

describe("narrowing transpile", () => {
  test("snapshots how TS narrowing constructs lower to Lua", () => {
    const source = [
      "export function inspect(x: unknown): string {",
      "  let out = '';",
      "  if (x) {",
      "    out = 'truthy';",
      "  }",
      "  if (typeof x === 'number') {",
      "    out = 'number';",
      "  }",
      "  if (typeof x === 'string') {",
      "    out = 'string';",
      "  }",
      "  if (typeof x === 'object') {",
      "    out = 'object';",
      "  }",
      "  if (typeof x === 'undefined') {",
      "    out = 'undefined';",
      "  }",
      "  if (x === null) {",
      "    out = 'null';",
      "  }",
      "  if (x === undefined) {",
      "    out = 'undef';",
      "  }",
      "  const kind = typeof x;",
      "  const n = x as number;",
      "  return out + kind + n;",
      "}",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toMatchSnapshot();
  });
});
