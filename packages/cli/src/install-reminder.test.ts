import { describe, expect, test } from "bun:test";
import { installHint } from "./install-reminder";

describe("installHint", () => {
  test("returns bun install for a bun user agent", () => {
    expect(installHint({ npm_config_user_agent: "bun/1.1.30 npm/? node/v22.0.0" })).toBe(
      "bun install",
    );
  });

  test("returns npm install for an npm user agent", () => {
    expect(installHint({ npm_config_user_agent: "npm/10.8.2 node/v22.0.0 linux x64" })).toBe(
      "npm install",
    );
  });

  test("returns pnpm install for a pnpm user agent", () => {
    expect(installHint({ npm_config_user_agent: "pnpm/9.7.0 npm/? node/v22.0.0" })).toBe(
      "pnpm install",
    );
  });

  test("returns yarn install for a yarn user agent", () => {
    expect(installHint({ npm_config_user_agent: "yarn/4.3.1 npm/? node/v22.0.0" })).toBe(
      "yarn install",
    );
  });

  test("falls back to bun install when the user agent is unset", () => {
    expect(installHint({})).toBe("bun install");
  });
});
