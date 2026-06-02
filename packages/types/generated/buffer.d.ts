/** @noSelfInFile */
import type { Hash, Opaque } from "../src/core-types";

declare global {
  namespace buffer {
    const VALUE_TYPE_FLOAT32: number & { readonly __brand: "buffer.VALUE_TYPE_FLOAT32" };
    const VALUE_TYPE_INT16: number & { readonly __brand: "buffer.VALUE_TYPE_INT16" };
    const VALUE_TYPE_INT32: number & { readonly __brand: "buffer.VALUE_TYPE_INT32" };
    const VALUE_TYPE_INT64: number & { readonly __brand: "buffer.VALUE_TYPE_INT64" };
    const VALUE_TYPE_INT8: number & { readonly __brand: "buffer.VALUE_TYPE_INT8" };
    const VALUE_TYPE_UINT16: number & { readonly __brand: "buffer.VALUE_TYPE_UINT16" };
    const VALUE_TYPE_UINT32: number & { readonly __brand: "buffer.VALUE_TYPE_UINT32" };
    const VALUE_TYPE_UINT64: number & { readonly __brand: "buffer.VALUE_TYPE_UINT64" };
    const VALUE_TYPE_UINT8: number & { readonly __brand: "buffer.VALUE_TYPE_UINT8" };
    function copy_buffer(dst: Opaque<"buffer">, dstoffset: number, src: Opaque<"buffer">, srcoffset: number, count: number): void;
    function copy_stream(dst: Opaque<"bufferstream">, dstoffset: number, src: Opaque<"bufferstream">, srcoffset: number, count: number): void;
    function create(element_count: number, declaration: { name?: Hash | string; type?: Opaque<"constant">; count?: number }): Opaque<"buffer">;
    function get_bytes(buffer: Opaque<"buffer">, stream_name: Hash): string;
    function get_metadata(buf: Opaque<"buffer">, metadata_name: Hash | string): LuaMultiReturn<[number[] | unknown, Opaque<"constant"> | unknown]>;
    function get_stream(buffer: Opaque<"buffer">, stream_name: Hash | string): Opaque<"bufferstream">;
    function set_metadata(buf: Opaque<"buffer">, metadata_name: Hash | string, values: number[], value_type: Opaque<"constant">): void;
  }
}

export {};
