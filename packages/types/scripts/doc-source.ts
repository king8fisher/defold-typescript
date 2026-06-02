import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { readZip, refDocUrl, type ZipAccessor } from "./sync-api-docs";

export type DocSourceProvenance = "cache" | "local" | "download";

export interface ResolvedRefDoc {
  zip: ZipAccessor;
  zipPath: string;
  provenance: DocSourceProvenance;
}

export type DownloadRefDoc = (version: string) => Promise<Uint8Array>;

export type LocateLocalRefDoc = (version: string) => string | null;

export function defaultDistributionRoots(
  platform: NodeJS.Platform,
  env: NodeJS.ProcessEnv = process.env,
  home: () => string = homedir,
): string[] {
  switch (platform) {
    case "darwin":
      return ["/Applications/Defold", join(home(), "Applications", "Defold")];
    case "linux":
      return [join(home(), "Defold"), "/opt/Defold"];
    case "win32":
      return [env.LOCALAPPDATA, env.PROGRAMFILES]
        .filter((root): root is string => Boolean(root))
        .map((root) => join(root, "Defold"));
    default:
      return [];
  }
}

export function localRefDocLocator(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  home: () => string = homedir,
): LocateLocalRefDoc {
  const roots = [
    ...(env.DEFOLD_TYPESCRIPT_LOCAL_DISTRIBUTION ? [env.DEFOLD_TYPESCRIPT_LOCAL_DISTRIBUTION] : []),
    ...defaultDistributionRoots(platform, env, home),
  ];
  return (version) => {
    for (const root of roots) {
      const path = join(root, version, "ref-doc.zip");
      if (existsSync(path)) {
        return path;
      }
    }
    return null;
  };
}

export function refDocCacheDir(
  env: NodeJS.ProcessEnv = process.env,
  home: () => string = homedir,
): string {
  if (env.DEFOLD_TYPESCRIPT_CACHE) {
    return join(env.DEFOLD_TYPESCRIPT_CACHE, "ref-doc");
  }
  return join(env.XDG_CACHE_HOME ?? join(home(), ".cache"), "defold-typescript", "ref-doc");
}

const fetchRefDoc: DownloadRefDoc = async (version) => {
  const url = refDocUrl(version);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`download failed: ${url} -> ${res.status} ${res.statusText}`);
  }
  return new Uint8Array(await res.arrayBuffer());
};

export async function resolveRefDoc(opts: {
  version: string;
  cacheDir: string;
  download?: DownloadRefDoc;
  locate?: LocateLocalRefDoc;
  readZip?: typeof readZip;
}): Promise<ResolvedRefDoc> {
  const open = opts.readZip ?? readZip;
  const zipPath = join(opts.cacheDir, opts.version, "ref-doc.zip");
  if (existsSync(zipPath)) {
    return { zip: open(zipPath), zipPath, provenance: "cache" };
  }
  const locate = opts.locate ?? localRefDocLocator();
  const localPath = locate(opts.version);
  if (localPath && existsSync(localPath)) {
    mkdirSync(dirname(zipPath), { recursive: true });
    copyFileSync(localPath, zipPath);
    return { zip: open(zipPath), zipPath, provenance: "local" };
  }
  const download = opts.download ?? fetchRefDoc;
  const bytes = await download(opts.version);
  mkdirSync(dirname(zipPath), { recursive: true });
  writeFileSync(zipPath, bytes);
  return { zip: open(zipPath), zipPath, provenance: "download" };
}
