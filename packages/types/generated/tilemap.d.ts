/** @noSelfInFile */
import type { Hash, Url } from "../src/core-types";

declare global {
  namespace tilemap {
    const H_FLIP: number & { readonly __brand: "tilemap.H_FLIP" };
    const ROTATE_180: number & { readonly __brand: "tilemap.ROTATE_180" };
    const ROTATE_270: number & { readonly __brand: "tilemap.ROTATE_270" };
    const ROTATE_90: number & { readonly __brand: "tilemap.ROTATE_90" };
    const V_FLIP: number & { readonly __brand: "tilemap.V_FLIP" };
    function get_bounds(url: string | Hash | Url): LuaMultiReturn<[number, number, number, number]>;
    function get_tile(url: string | Hash | Url, layer: string | Hash, x: number, y: number): number;
    function get_tile_info(url: string | Hash | Url, layer: string | Hash, x: number, y: number): Record<string | number, unknown>;
    function get_tiles(url: string | Hash | Url, layer: string | Hash): Record<string | number, unknown>;
    function set_tile(url: string | Hash | Url, layer: string | Hash, x: number, y: number, tile: number, transform_bitmask?: number): void;
    function set_visible(url: string | Hash | Url, layer: string | Hash, visible: boolean): void;
    interface properties {
      material: Hash;
      tile_source: Hash;
    }
  }
}

export {};
