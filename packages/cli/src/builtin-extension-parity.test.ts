import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveTypesPackageRoot } from "./api-registry";
import { BUILTIN_EXTENSION_NAMESPACES, emitExtensionDeclarationFromDoc } from "./extension-emit";

const typesRoot = resolveTypesPackageRoot();

describe("built-in extension parity", () => {
  test("BUILTIN_EXTENSION_NAMESPACES is the four built-ins", () => {
    expect(BUILTIN_EXTENSION_NAMESPACES).toEqual(["iac", "iap", "push", "webview"]);
  });

  test("resolveTypesPackageRoot resolves the monorepo types package", () => {
    expect(typesRoot).not.toBeNull();
  });

  for (const ns of BUILTIN_EXTENSION_NAMESPACES) {
    test(`${ns}: doc-core emit is byte-equal to the committed generated decl`, async () => {
      if (typesRoot === null) {
        throw new Error("@defold-typescript/types must resolve in the monorepo");
      }
      const doc = JSON.parse(readFileSync(join(typesRoot, "fixtures", `${ns}_doc.json`), "utf8"));
      const generated = readFileSync(join(typesRoot, "generated", `${ns}.d.ts`), "utf8");
      const { namespace, contents, dropped } = await emitExtensionDeclarationFromDoc(doc);
      expect(namespace).toBe(ns);
      expect(contents).toBe(generated);
      expect(dropped).toEqual([]);
    });
  }
});
