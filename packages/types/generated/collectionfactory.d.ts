/** @noSelfInFile */
import type { Hash, Opaque, Quaternion, Url, Vector3 } from "../src/core-types";

declare global {
  namespace collectionfactory {
    const STATUS_LOADED: number & { readonly __brand: "collectionfactory.STATUS_LOADED" };
    const STATUS_LOADING: number & { readonly __brand: "collectionfactory.STATUS_LOADING" };
    const STATUS_UNLOADED: number & { readonly __brand: "collectionfactory.STATUS_UNLOADED" };
    function create(url: string | Hash | Url, position?: Vector3, rotation?: Quaternion, properties?: Record<string | number, unknown>, scale?: number | Vector3): Record<string | number, unknown>;
    function get_status(url?: string | Hash | Url): Opaque<"constant">;
    function load(url?: string | Hash | Url, complete_function?: (self: unknown, url: unknown, result: unknown) => void): void;
    function set_prototype(url?: string | Hash | Url, prototype?: string): void;
    function unload(url?: string | Hash | Url): void;
  }
}

export {};
