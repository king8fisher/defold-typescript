/** @noSelfInFile */
import type { Hash, Opaque, Quaternion, Url, Vector3, Vector4 } from "./core-types";

declare global {
  namespace go {
    interface GoPropertyOptions {
      index?: number;
      key?: Hash;
      keys?: Record<string | number, unknown>;
    }

    function get<K extends keyof go.properties>(
      url: string | Hash | Url,
      property: K,
      options?: GoPropertyOptions,
    ): go.properties[K];
    function get(
      url: string | Hash | Url,
      property: string | Hash,
      options?: GoPropertyOptions,
    ): number | boolean | Hash | Url | Vector3 | Vector4 | Quaternion | Opaque<"resource">;
    function set<K extends keyof go.properties>(
      url: string | Hash | Url,
      property: K,
      value: go.properties[K],
      options?: GoPropertyOptions,
    ): void;
    function set(
      url: string | Hash | Url,
      property: string | Hash,
      value: number | boolean | Hash | Url | Vector3 | Vector4 | Quaternion | Opaque<"resource">,
      options?: GoPropertyOptions,
    ): void;
  }
}
