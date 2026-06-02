/** @noSelfInFile */
import type { Hash, Opaque } from "../src/core-types";

declare global {
  namespace resource {
    function atlas(path?: string): Hash;
    function buffer(path?: string): Hash;
    function create_atlas(path: string, table: { texture?: string | Hash; animations?: { id?: string; width?: number; height?: number; frame_start?: number; frame_end?: number; playback?: Opaque<"constant">; fps?: number; flip_vertical?: boolean; flip_horizontal?: boolean }[]; geometries?: { id?: string; width?: number; height?: number; pivot_x?: number; pivot_y?: number; rotated?: boolean }[]; vertices?: number[]; uvs?: number[]; indices?: number[] }): Hash;
    function create_buffer(path: string, table?: { buffer?: Opaque<"buffer">; transfer_ownership?: boolean }): Hash;
    function create_sound_data(path: string, options?: { data?: string; filesize?: number; partial?: boolean }): Hash;
    function create_texture(path: string, table: { type?: number; width?: number; height?: number; depth?: number; format?: number; flags?: number; max_mipmaps?: number; compression_type?: number }, buffer: Opaque<"buffer">): Hash;
    function create_texture_async(path: string | Hash, table: { type?: number; width?: number; height?: number; depth?: number; format?: number; flags?: number; max_mipmaps?: number; compression_type?: number }, buffer: Opaque<"buffer">, callback: (...args: unknown[]) => unknown): LuaMultiReturn<[Hash, number]>;
    function font(path?: string): Hash;
    function get_atlas(path: Hash | string): { texture: string | Hash; animations: { id: string; width: number; height: number; frame_start: number; frame_end: number; playback: Opaque<"constant">; fps: number; flip_vertical: boolean; flip_horizontal: boolean }[]; geometries: Record<string | number, unknown> };
    function get_buffer(path: Hash | string): Opaque<"buffer">;
    function get_render_target_info(path: Hash | string | number): { handle: number; width: number; height: number; depth: number; mipmaps: number; type: number; buffer_type: number; texture: Hash };
    function get_text_metrics(url: Hash, text: string, options?: { width?: number; leading?: number; tracking?: number; line_break?: boolean }): Record<string | number, unknown>;
    function get_texture_info(path: Hash | string | number): { handle: number; width: number; height: number; depth: number; page_count: number; mipmaps: number; flags: number; type: number };
    function load(path: string): Opaque<"buffer">;
    function material(path?: string): Hash;
    function release(path: Hash | string): void;
    function render_target(path?: string): Hash;
    function set(path: string | Hash, buffer: Opaque<"buffer">): void;
    function set_atlas(path: Hash | string, table: { texture?: string | Hash; animations?: { id?: string; width?: number; height?: number; frame_start?: number; frame_end?: number; playback?: Opaque<"constant">; fps?: number; flip_vertical?: boolean; flip_horizontal?: boolean }[]; geometries?: Record<string | number, unknown>; vertices?: number[]; uvs?: number[]; indices?: number[] }): void;
    function set_buffer(path: Hash | string, buffer: Opaque<"buffer">, table?: { transfer_ownership?: boolean }): void;
    function set_sound(path: Hash | string, buffer: string): void;
    function set_texture(path: Hash | string, table: { type?: number; width?: number; height?: number; format?: number; x?: number; y?: number; z?: number; page?: number; mipmap?: number; compression_type?: number }, buffer: Opaque<"buffer">): void;
    function texture(path?: string): Hash;
    function tile_source(path?: string): Hash;
  }
}

export {};
