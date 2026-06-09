import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseMessagesDoc } from "./emit-messages";

const FIXTURES_DIR = join(import.meta.dir, "..", "fixtures");
const CATALOG_FILE = "messages_doc.json";

function loadCatalogPayloads(): Map<string, Set<string>> {
  const raw = JSON.parse(readFileSync(join(FIXTURES_DIR, CATALOG_FILE), "utf8"));
  const catalog = parseMessagesDoc(raw);
  const byName = new Map<string, Set<string>>();
  for (const entry of catalog.entries) {
    byName.set(entry.name, new Set(entry.payload.map((field) => field.name)));
  }
  return byName;
}

interface MessageElement {
  fixture: string;
  name: string;
  parameterNames: Set<string>;
}

function collectMessageElements(): MessageElement[] {
  const elements: MessageElement[] = [];
  for (const fixture of readdirSync(FIXTURES_DIR)) {
    if (!fixture.endsWith("_doc.json") || fixture === CATALOG_FILE) continue;
    const raw = JSON.parse(readFileSync(join(FIXTURES_DIR, fixture), "utf8"));
    const docElements = Array.isArray(raw.elements) ? raw.elements : [];
    for (const element of docElements) {
      if (element?.type !== "MESSAGE") continue;
      const params = Array.isArray(element.parameters) ? element.parameters : [];
      const parameterNames = new Set<string>(
        params
          .map((p: { name?: unknown }) => p?.name)
          .filter((name: unknown): name is string => typeof name === "string"),
      );
      elements.push({ fixture, name: element.name, parameterNames });
    }
  }
  return elements;
}

describe("message payload ref-doc drift guard", () => {
  const catalog = loadCatalogPayloads();
  const messageElements = collectMessageElements();

  test("finds MESSAGE elements to compare", () => {
    expect(messageElements.length).toBeGreaterThan(0);
  });

  test("every namespace MESSAGE element exists in the catalog with an exact field-name set", () => {
    for (const element of messageElements) {
      const catalogFields = catalog.get(element.name);
      expect(
        catalogFields,
        `${element.fixture}: "${element.name}" missing from catalog`,
      ).toBeDefined();
      if (!catalogFields) continue;
      expect(
        [...catalogFields].sort(),
        `${element.fixture}: "${element.name}" payload field-name set drifted from ref-doc`,
      ).toEqual([...element.parameterNames].sort());
    }
  });

  test("play_sound catalog payload includes start_time and start_frame", () => {
    const fields = catalog.get("play_sound");
    expect(fields).toBeDefined();
    expect(fields?.has("start_time")).toBe(true);
    expect(fields?.has("start_frame")).toBe(true);
  });
});
