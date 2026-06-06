import { describe, expect, test } from "bun:test";
import * as path from "node:path";
import {
  DEBUG_LAUNCHER_REL,
  DEBUG_LAUNCHER_SOURCE,
  debugLaunchConfig,
  engineDownloadUrl,
  resolveEnginePath,
  targetPlatform,
  VSCODE_LAUNCH_CONTENT,
} from "./debug-launcher";

describe("targetPlatform", () => {
  test("maps Apple Silicon macOS to the arm64-macos engine", () => {
    expect(targetPlatform("darwin", "arm64")).toEqual({
      enginePlatform: "arm64-macos",
      buildFolder: "arm64-macos",
      executable: "dmengine",
    });
  });

  test("maps Intel macOS to the x86_64-macos engine", () => {
    expect(targetPlatform("darwin", "x64")).toEqual({
      enginePlatform: "x86_64-macos",
      buildFolder: "x86_64-macos",
      executable: "dmengine",
    });
  });

  test("maps linux x64 to the linux engine", () => {
    expect(targetPlatform("linux", "x64")).toEqual({
      enginePlatform: "x86_64-linux",
      buildFolder: "x86_64-linux",
      executable: "dmengine",
    });
  });

  test("maps win32 x64 to the win32 engine with the .exe executable", () => {
    expect(targetPlatform("win32", "x64")).toEqual({
      enginePlatform: "x86_64-win32",
      buildFolder: "x86_64-win32",
      executable: "dmengine.exe",
    });
  });

  test("throws on an unknown platform", () => {
    expect(() => targetPlatform("aix" as NodeJS.Platform, "x64")).toThrow(/unsupported platform/);
  });

  test("throws on an unsupported arch for a known platform", () => {
    expect(() => targetPlatform("linux", "arm64")).toThrow(/unsupported platform/);
  });
});

describe("engineDownloadUrl", () => {
  test("builds the d.defold.com archive URL from sha1, platform, and executable", () => {
    expect(engineDownloadUrl("abc123", "arm64-macos", "dmengine")).toBe(
      "https://d.defold.com/archive/stable/abc123/engine/arm64-macos/dmengine",
    );
    expect(engineDownloadUrl("def456", "x86_64-win32", "dmengine.exe")).toBe(
      "https://d.defold.com/archive/stable/def456/engine/x86_64-win32/dmengine.exe",
    );
  });
});

describe("resolveEnginePath", () => {
  const cwd = "/proj";
  const target = targetPlatform("darwin", "arm64");
  const stockPath = "/proj/.vscode/dmengine";
  const buildEnginePath = path.join(cwd, "build", target.buildFolder, target.executable);

  test("returns the native-extension build engine when its probe hits", () => {
    const resolved = resolveEnginePath({
      cwd,
      target,
      stockPath,
      probe: (candidate) => candidate === buildEnginePath,
    });
    expect(resolved).toBe(buildEnginePath);
  });

  test("falls back to the cached stock engine when the build engine is absent", () => {
    const resolved = resolveEnginePath({
      cwd,
      target,
      stockPath,
      probe: () => false,
    });
    expect(resolved).toBe(stockPath);
  });
});

describe("debugLaunchConfig / scaffolded artifacts", () => {
  test("the launch config runs bun against the scaffolded launcher, never bash", () => {
    const config = debugLaunchConfig();
    expect(config.type).toBe("lua-local");
    expect(config.program.command).toBe("bun");
    expect(config.args).toEqual([DEBUG_LAUNCHER_REL]);
    expect(JSON.stringify(config)).not.toContain("bash");
  });

  test("the launch config declares scriptFiles/scriptRoots so .ts breakpoints bind", () => {
    const config = debugLaunchConfig();
    expect(config.scriptFiles).toEqual(["src/**/*.ts.script"]);
    expect(config.scriptRoots).toEqual([".", "src"]);
  });

  test("VSCODE_LAUNCH_CONTENT carries exactly the one lua-local config", () => {
    expect(VSCODE_LAUNCH_CONTENT.version).toBe("0.2.0");
    expect(VSCODE_LAUNCH_CONTENT.configurations).toEqual([debugLaunchConfig()]);
  });

  test("the launcher source is a self-contained Bun script with no shell dependency", () => {
    expect(DEBUG_LAUNCHER_SOURCE).toContain("Bun.spawn");
    expect(DEBUG_LAUNCHER_SOURCE).not.toContain("bash");
    expect(DEBUG_LAUNCHER_SOURCE).not.toMatch(/\.sh\b/);
  });

  test("the launcher embeds the same platform table the helpers use (lockstep)", () => {
    const combos: [NodeJS.Platform, string][] = [
      ["darwin", "arm64"],
      ["darwin", "x64"],
      ["linux", "x64"],
      ["win32", "x64"],
    ];
    for (const [platform, arch] of combos) {
      const { enginePlatform, buildFolder } = targetPlatform(platform, arch);
      expect(DEBUG_LAUNCHER_SOURCE).toContain(enginePlatform);
      expect(DEBUG_LAUNCHER_SOURCE).toContain(buildFolder);
    }
  });
});
