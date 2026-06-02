// Tag and push a release commit after it has been published to npm.
//
// Publishing is local (`mise run publish <version> --publish`); release.yml is
// parked, so there is no CI publish. This task only creates and pushes the git
// tag for a version already on npm.
//
// Usage:
//   bun scripts/release.ts <version>

import { spawnSync } from "node:child_process";
import * as path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dir, "..");
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

export const HELP = `Manually tag and push a release that is already on npm.

Usage:
  mise run release <version>
  bun scripts/release.ts <version>

This is a fallback: \`mise run publish <version> --publish\` already tags and
pushes v<version> on success. Use this only to re-tag a version that published
but whose tag did not land (e.g. the push failed). It creates and pushes the
git tag; it does NOT publish. (release.yml is parked — publishing is local.)

Arguments:
  <version>   the x.y.z version already published, no leading v (e.g. 0.2.0)

Flags:
  -h, --help  show this help

Examples:
  mise run release 0.2.0              # tag v0.2.0 and push it`;

export interface Args {
  readonly version: string | null;
  readonly help: boolean;
}

export function parseArgs(argv: readonly string[]): Args {
  const positional: string[] = [];
  let help = false;
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      help = true;
    } else if (arg.startsWith("-")) {
      throw new Error(`unknown flag: ${arg}`);
    } else {
      positional.push(arg);
    }
  }
  if (positional.length > 1) {
    throw new Error(`expected a single <version>, got: ${positional.join(", ")}`);
  }
  return { version: positional[0] ?? null, help };
}

export function isVersion(value: string): boolean {
  return SEMVER.test(value);
}

function run(cmd: string[]): number {
  const [bin, ...rest] = cmd;
  if (!bin) {
    throw new Error("run() called with an empty command");
  }
  return spawnSync(bin, rest, { cwd: REPO_ROOT, stdio: "inherit" }).status ?? 1;
}

function fail(message: string): never {
  process.stderr.write(`release: ${message}\n\n${HELP}\n`);
  process.exit(1);
}

function main(): void {
  let args: Args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    fail((err as Error).message);
  }

  if (args.help) {
    process.stdout.write(`${HELP}\n`);
    return;
  }
  if (args.version === null) {
    fail("missing <version>");
  }
  if (!isVersion(args.version)) {
    fail(`'${args.version}' is not an x.y.z version`);
  }

  const tag = `v${args.version}`;
  process.stdout.write(`Tagging ${tag}...\n`);
  if (run(["git", "tag", "-a", tag, "-m", `Release ${tag}`]) !== 0) {
    fail(`could not create tag ${tag} (does it already exist?)`);
  }
  if (run(["git", "push", "origin", tag]) !== 0) {
    fail(`could not push tag ${tag}`);
  }
  process.stdout.write(
    `Pushed ${tag}. (release.yml is parked; npm publish is local via mise run publish.)\n`,
  );
}

if (import.meta.main) {
  main();
}
