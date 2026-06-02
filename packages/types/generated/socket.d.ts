/** @noSelfInFile */
import type { Opaque } from "../src/core-types";

declare global {
  namespace socket {
    type client = Opaque<"client">;
    type master = Opaque<"master">;
    type unconnected = Opaque<"unconnected">;
    const _SETSIZE: number & { readonly __brand: "socket._SETSIZE" };
    const _VERSION: number & { readonly __brand: "socket._VERSION" };
    function connect(address: string, port: number, locaddr?: string, locport?: number, family?: string): LuaMultiReturn<[Opaque<"client"> | unknown, string | unknown]>;
    function gettime(): number;
    function newtry(finalizer: () => void): (...args: unknown[]) => unknown;
    function protect(func: (...args: unknown[]) => unknown): (arg0: unknown) => void;
    function select(recvt: Record<string | number, unknown>, sendt: Record<string | number, unknown>, timeout?: number): LuaMultiReturn<[Record<string | number, unknown>, Record<string | number, unknown>, string | unknown]>;
    function skip(d: number, ret1?: unknown, ret2?: unknown, retN?: unknown): LuaMultiReturn<[unknown, unknown, unknown]>;
    function sleep(time: number): void;
    function tcp(): LuaMultiReturn<[Opaque<"master"> | unknown, string | unknown]>;
    function tcp6(): LuaMultiReturn<[Opaque<"master"> | unknown, string | unknown]>;
    function udp(): LuaMultiReturn<[Opaque<"unconnected"> | unknown, string | unknown]>;
    function udp6(): LuaMultiReturn<[Opaque<"unconnected"> | unknown, string | unknown]>;
  }
}

export {};
