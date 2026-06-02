import { createTranspileSession, type TranspileSession } from "../src/index";

export interface BenchmarkProject {
  readonly files: Record<string, string>;
  readonly editFile: string;
  readonly editedText: string;
}

export interface BenchmarkResult {
  readonly elapsedMs: number;
  readonly changedFile: string;
  readonly seedLua: Record<string, string>;
  readonly editedLua: Record<string, string>;
}

export function buildBenchmarkProject(n: number): BenchmarkProject {
  const files: Record<string, string> = {};
  for (let i = 0; i < n; i++) {
    const rel = `src/mod${i}.ts`;
    files[rel] =
      i === 0
        ? `export const v0 = 0;\n`
        : `import { v${i - 1} } from "./mod${i - 1}";\nexport const v${i} = v${i - 1} + ${i};\n`;
  }
  return {
    files,
    editFile: "src/mod0.ts",
    editedText: "export const v0 = 100;\n",
  };
}

export function runIncrementalBenchmark(
  session: TranspileSession,
  project: BenchmarkProject,
): BenchmarkResult {
  const seed = session.update(project.files);
  const start = performance.now();
  const after = session.update({ [project.editFile]: project.editedText });
  const elapsedMs = performance.now() - start;
  return {
    elapsedMs,
    changedFile: project.editFile,
    seedLua: { ...seed.lua },
    editedLua: { ...after.lua },
  };
}

function main(): void {
  const project = buildBenchmarkProject(30);
  const session = createTranspileSession();
  const { elapsedMs } = runIncrementalBenchmark(session, project);
  console.log(`single-file rebuild: ${elapsedMs.toFixed(1)} ms (target < 200 ms)`);
}

if (import.meta.main) {
  main();
}
