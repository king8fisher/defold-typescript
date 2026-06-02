/** @noSelfInFile */
import type { Opaque } from "../src/core-types";

declare global {
  namespace iap {
    function acknowledge(transaction: Record<string | number, unknown>): void;
    function buy(id: string, options: Record<string | number, unknown>): void;
    function finish(transaction: Record<string | number, unknown>): void;
    function get_provider_id(): Opaque<"constant">;
    function list(ids: string[], callback: (...args: unknown[]) => unknown): void;
    function restore(): boolean;
    function set_listener(listener: (...args: unknown[]) => unknown): void;
  }
}

export {};
