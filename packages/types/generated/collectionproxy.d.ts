/** @noSelfInFile */
import type { Hash, Url } from "../src/core-types";

declare global {
  namespace collectionproxy {
    const RESULT_ALREADY_LOADED: number & { readonly __brand: "collectionproxy.RESULT_ALREADY_LOADED" };
    const RESULT_LOADING: number & { readonly __brand: "collectionproxy.RESULT_LOADING" };
    const RESULT_NOT_EXCLUDED: number & { readonly __brand: "collectionproxy.RESULT_NOT_EXCLUDED" };
    function get_resources(collectionproxy: Url): Record<string | number, unknown>;
    function set_collection(url?: string | Hash | Url, prototype?: string): LuaMultiReturn<[boolean, number]>;
  }
}

export {};
