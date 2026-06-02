/** @noSelfInFile */
import type { Hash, Opaque, Url } from "../src/core-types";

declare global {
  namespace model {
    function cancel(url: string | Hash | Url): void;
    function get_aabb(url: string | Hash | Url): Record<string | number, unknown>;
    function get_go(url: string | Hash | Url, bone_id: string | Hash): Hash;
    function get_mesh_aabb(url: string | Hash | Url): Record<string | number, unknown>;
    function get_mesh_enabled(url: string | Hash | Url, mesh_id: string | Hash | Url): boolean;
    function play_anim(url: string | Hash | Url, anim_id: string | Hash, playback: Opaque<"constant">, play_properties?: { blend_duration?: number; offset?: number; playback_rate?: number }, complete_function?: (self: unknown, message_id: unknown, message: unknown, sender: unknown) => void): void;
    function set_mesh_enabled(url: string | Hash | Url, mesh_id: string | Hash | Url, enabled: boolean): void;
    interface properties {
      animation: Hash;
      cursor: number;
      material: Hash;
      playback_rate: number;
      textureN: Hash;
    }
  }
}

export {};
