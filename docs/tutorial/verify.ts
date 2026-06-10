#!/usr/bin/env bun
/**
 * Verify every snippet under snippets/ appears verbatim in the tutorial's
 * own canonical src/player.ts. Run via `bun run verify` (or as part of
 * `bun run build`). A failure here means a snippet drifted from the
 * authoritative source — re-extract the region from src/player.ts into
 * the matching snippets/NN-*.ts_ file and re-run.
 *
 * Whitespace is normalized before comparison (trailing whitespace stripped,
 * CRLF collapsed to LF) so editor-style differences don't false-positive.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const HERE = import.meta.dir;
const SNIPPETS_DIR = join(HERE, "snippets");
const SOURCE = join(HERE, "src", "player.ts");

function normalize(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "");
}

export type VerifyResult = {
  ok: boolean;
  checked: number;
  failures: { file: string; reason: string }[];
};

/**
 * Verify all snippets. If `throwOnFailure` is true, throw on the first
 * failure (the script entry-point uses this to exit non-zero). Otherwise
 * return a structured result and let the caller decide.
 */
export async function verifySnippets({
  throwOnFailure = false,
}: {
  throwOnFailure?: boolean;
} = {}): Promise<VerifyResult> {
  const source = normalize(await readFile(SOURCE, "utf8"));

  const entries = (await readdir(SNIPPETS_DIR)).filter((f) => f.endsWith(".ts_")).sort();

  const failures: { file: string; reason: string }[] = [];

  for (const entry of entries) {
    const snippetPath = join(SNIPPETS_DIR, entry);
    const snippet = normalize(await readFile(snippetPath, "utf8"));

    if (snippet.length === 0) {
      failures.push({ file: entry, reason: "empty snippet" });
      console.error(`✗ ${entry}: empty snippet`);
      continue;
    }

    if (!source.includes(snippet)) {
      const firstLine = snippet.split("\n").find((l) => l.trim().length > 0) ?? "";
      const reason = `not found verbatim in player.ts (first non-blank: ${firstLine.slice(0, 80)})`;
      failures.push({ file: entry, reason });
      console.error(`✗ ${entry}: ${reason}`);
      continue;
    }

    const sourceRel = relative(HERE, SOURCE);
    console.log(`✓ ${entry}  (matches ${sourceRel})`);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} snippet(s) drifted from ${relative(HERE, SOURCE)}.`);
    if (throwOnFailure) {
      throw new Error(`Snippet drift: ${failures.length} file(s) out of date.`);
    }
  } else {
    console.log(`\nAll ${entries.length} snippet(s) match ${relative(HERE, SOURCE)}.`);
  }

  return { ok: failures.length === 0, checked: entries.length, failures };
}

// CLI entry: only run when invoked as the script, not when imported.
if (import.meta.main) {
  const result = await verifySnippets();
  if (!result.ok) process.exit(1);
}
