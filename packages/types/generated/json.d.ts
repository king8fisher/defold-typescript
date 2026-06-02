/** @noSelfInFile */
declare global {
  namespace json {
    const _null: unknown;
    export function decode(json: string, options?: { decode_null_as_userdata?: boolean }): Record<string | number, unknown>;
    export function encode(tbl: Record<string | number, unknown>, options?: { encode_empty_table_as_object?: string }): string;
    export { _null as null };
  }
}

export {};
