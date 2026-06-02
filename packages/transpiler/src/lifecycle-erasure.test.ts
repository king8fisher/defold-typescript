import { describe, expect, test } from "bun:test";
import { transpile } from "./transpile";

describe("lifecycle erasure", () => {
  test("erases defineScript to flat top-level chunk functions", () => {
    const source = [
      'import { defineScript } from "@defold-typescript/types";',
      "",
      "defineScript({",
      "  init(self) {},",
      "  update(self, dt) {},",
      "});",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toMatchInlineSnapshot(`
      "--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
      local ____exports = {}
      function init(self)
      end
      function update(self, dt)
      end
      return ____exports
      "
    `);
    expect(result.lua).not.toContain("defineScript");
    expect(result.lua).not.toContain("require(");
  });

  test("preserves on_message body and four params, transpiling ambient calls", () => {
    const source = [
      'import { defineScript } from "@defold-typescript/types";',
      "",
      "defineScript({",
      "  on_message(self, message_id, message, sender) {",
      "    msg.post('main:/hero', 'pong', {});",
      "  },",
      "});",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toMatchInlineSnapshot(`
      "--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
      local ____exports = {}
      function on_message(self, message_id, message, sender)
          msg.post("main:/hero", "pong", {})
      end
      return ____exports
      "
    `);
    expect(result.lua).toContain("function on_message(self, message_id, message, sender)");
    expect(result.lua).not.toContain("defineScript");
  });

  test("erases defineRenderScript identically", () => {
    const source = [
      'import { defineRenderScript } from "@defold-typescript/types";',
      "",
      "defineRenderScript({",
      "  init(self) {},",
      "  update(self, dt) {},",
      "});",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toMatchInlineSnapshot(`
      "--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
      local ____exports = {}
      function init(self)
      end
      function update(self, dt)
      end
      return ____exports
      "
    `);
    expect(result.lua).not.toContain("defineRenderScript");
    expect(result.lua).not.toContain("require(");
  });

  test("erases defineGuiScript identically", () => {
    const source = [
      'import { defineGuiScript } from "@defold-typescript/types";',
      "",
      "defineGuiScript({",
      "  init(self) {},",
      "  update(self, dt) {},",
      "});",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toMatchInlineSnapshot(`
      "--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
      local ____exports = {}
      function init(self)
      end
      function update(self, dt)
      end
      return ____exports
      "
    `);
    expect(result.lua).not.toContain("defineGuiScript");
    expect(result.lua).not.toContain("require(");
  });

  test("erases export default defineScript form", () => {
    const source = [
      'import { defineScript } from "@defold-typescript/types";',
      "",
      "export default defineScript({",
      "  init(self) {},",
      "});",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toMatchInlineSnapshot(`
      "--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
      local ____exports = {}
      function init(self)
      end
      return ____exports
      "
    `);
    expect(result.lua).not.toContain("defineScript");
  });

  test("does not erase a non-factory local call of the same name", () => {
    const source = [
      "function defineScript(hooks: { init(): void }): void {",
      "  hooks.init();",
      "}",
      "",
      "defineScript({",
      "  init() {},",
      "});",
      "",
    ].join("\n");
    const result = transpile(source);
    expect(result.diagnostics).toEqual([]);
    expect(result.lua).toContain("init = function");
    expect(result.lua).not.toContain("function init(self)");
  });
});
