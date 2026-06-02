/** @noSelfInFile */
import type { Opaque } from "../src/core-types";

declare global {
  namespace image {
    const TYPE_LUMINANCE: number & { readonly __brand: "image.TYPE_LUMINANCE" };
    const TYPE_LUMINANCE_ALPHA: number & { readonly __brand: "image.TYPE_LUMINANCE_ALPHA" };
    const TYPE_RGB: number & { readonly __brand: "image.TYPE_RGB" };
    const TYPE_RGBA: number & { readonly __brand: "image.TYPE_RGBA" };
    function get_astc_header(buffer: string): { width: number; height: number; depth: number; block_size_x: number; block_size_y: number; block_size_z: number } | unknown;
    function load(buffer: string, options?: { premultiply_alpha?: boolean; flip_vertically?: boolean }): { width: number; height: number; type: Opaque<"constant">; buffer: string } | unknown;
    function load_buffer(buffer: string, options?: { premultiply_alpha?: boolean; flip_vertically?: boolean }): { width: number; height: number; type: Opaque<"constant">; buffer: Opaque<"buffer"> } | unknown;
  }
}

export {};
