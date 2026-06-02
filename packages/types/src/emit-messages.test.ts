import { describe, expect, test } from "bun:test";
import { emitBuiltinMessages, type MessageCatalog, parseMessagesDoc } from "./emit-messages";

const TWO_ENTRY_RAW: unknown = {
  info: { namespace: "builtin_messages" },
  messages: [
    {
      name: "acquire_input_focus",
      origin: "go",
      description: "",
      payload: [],
    },
    {
      name: "set_parent",
      origin: "go",
      description: "",
      payload: [
        { name: "parent_id", types: ["hash"], optional: true, doc: "" },
        { name: "keep_world_transform", types: ["0", "1"], optional: true, doc: "" },
      ],
    },
  ],
};

describe("parseMessagesDoc", () => {
  test("returns entries with name, origin, and payload", () => {
    const catalog = parseMessagesDoc(TWO_ENTRY_RAW);
    expect(catalog.entries).toHaveLength(2);
    const acquire = catalog.entries[0];
    if (!acquire) throw new Error("missing entry");
    expect(acquire.name).toBe("acquire_input_focus");
    expect(acquire.origin).toBe("go");
    expect(acquire.payload).toEqual([]);

    const setParent = catalog.entries[1];
    if (!setParent) throw new Error("missing entry");
    expect(setParent.name).toBe("set_parent");
    expect(setParent.payload).toHaveLength(2);
    expect(setParent.payload[0]).toEqual({
      name: "parent_id",
      types: ["hash"],
      optional: true,
      doc: "",
    });
  });

  test("rejects non-object input", () => {
    expect(() => parseMessagesDoc(null)).toThrow();
    expect(() => parseMessagesDoc(42)).toThrow();
  });
});

describe("emitBuiltinMessages", () => {
  test("emits BuiltinMessages interface with literal-string keys and mapped payload shapes", () => {
    const catalog = parseMessagesDoc(TWO_ENTRY_RAW);
    const out = emitBuiltinMessages(catalog);
    expect(out).toContain("interface BuiltinMessages");
    expect(out).toContain("acquire_input_focus: Record<string, never>;");
    expect(out).toContain("set_parent: { parent_id?: Hash; keep_world_transform?: 0 | 1 };");
    expect(out).toContain("type BuiltinMessageId = keyof BuiltinMessages;");
  });

  test("emits a Hash import when any payload uses hash", () => {
    const catalog = parseMessagesDoc(TWO_ENTRY_RAW);
    const out = emitBuiltinMessages(catalog);
    expect(out).toMatch(/import type \{[^}]*\bHash\b[^}]*\} from "\.\.\/src\/core-types";/);
  });

  test("emits empty-payload messages as Record<string, never>, not unknown or never", () => {
    const catalog: MessageCatalog = {
      entries: [{ name: "ping", origin: "go", description: "", payload: [] }],
    };
    const out = emitBuiltinMessages(catalog);
    expect(out).toContain("ping: Record<string, never>;");
    expect(out).not.toContain("ping: unknown");
    expect(out).not.toContain("ping: never");
  });

  test("field-level mapping reuses DEFOLD_TYPE_MAP (hash -> Hash, vector3 -> Vector3)", () => {
    const catalog: MessageCatalog = {
      entries: [
        {
          name: "demo",
          origin: "physics",
          description: "",
          payload: [
            { name: "h", types: ["hash"], optional: false, doc: "" },
            { name: "v", types: ["vector3"], optional: false, doc: "" },
            { name: "b", types: ["boolean"], optional: false, doc: "" },
          ],
        },
      ],
    };
    const out = emitBuiltinMessages(catalog);
    expect(out).toContain("demo: { h: Hash; v: Vector3; b: boolean };");
  });

  test("output is syntactically-valid TypeScript", () => {
    const catalog = parseMessagesDoc(TWO_ENTRY_RAW);
    const out = emitBuiltinMessages(catalog);
    const transpiler = new Bun.Transpiler({ loader: "ts" });
    expect(() => transpiler.scan(out)).not.toThrow();
  });
});
