import type { DirectoryWall } from "./directory-walls";
import { groupSourceScriptKindsByDirectory } from "./directory-walls";
import { selectScriptKind } from "./script-kind";
import { applyWallSelection, currentWalledDirs } from "./wall";

export interface WallChoice {
  readonly value: string;
  readonly name: string;
  readonly checked?: boolean;
  readonly disabled?: string | false;
}

// Injected so the dispatch route and tests can substitute a fake; the default is
// `@inquirer/prompts`'s `checkbox`, imported lazily so the prompt module never
// loads on the non-interactive paths.
export type CheckboxPrompt = (opts: {
  message: string;
  choices: WallChoice[];
}) => Promise<string[]>;

export interface WallInteractiveDeps {
  readonly checkbox?: CheckboxPrompt;
}

// One choice per source directory: a single-kind dir is selectable and
// pre-checked to its current walled state; a mixed-kind dir is shown disabled
// with its competing kinds, since no single narrowing applies.
export function buildWallChoices(cwd: string): WallChoice[] {
  const current = new Set(currentWalledDirs(cwd));
  const choices: WallChoice[] = [];
  for (const [dir, kinds] of groupSourceScriptKindsByDirectory(cwd)) {
    const kind = selectScriptKind(kinds);
    if (kind === null) {
      choices.push({ value: dir, name: dir, disabled: `mixed: ${[...kinds].sort().join(", ")}` });
    } else {
      choices.push({ value: dir, name: `${dir} (${kind})`, checked: current.has(dir) });
    }
  }
  return choices.sort((a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));
}

async function defaultCheckbox(): Promise<CheckboxPrompt> {
  const { checkbox } = await import("@inquirer/prompts");
  return (opts) => checkbox({ message: opts.message, choices: opts.choices });
}

// Presentation only: the checkbox selection is the desired wall set, reconciled
// to disk through the slice E engine (check = add, uncheck = remove), so the
// interactive and flag paths can never diverge.
export async function runWallInteractive(
  cwd: string,
  deps: WallInteractiveDeps = {},
): Promise<DirectoryWall[]> {
  const checkbox = deps.checkbox ?? (await defaultCheckbox());
  const selection = await checkbox({
    message: "Select the source directories to wall (space toggles, enter confirms):",
    choices: buildWallChoices(cwd),
  });
  return applyWallSelection(cwd, selection);
}
