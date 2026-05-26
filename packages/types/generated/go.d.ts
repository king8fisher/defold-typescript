import type { Hash, Matrix4, Quaternion, Url, Vector, Vector3, Vector4 } from "../src/core-types";

declare global {
  namespace go {
    function animate(url: string | Hash | Url, property: string | Hash, playback: unknown, to: number | Vector3 | Vector4 | Quaternion, easing: Vector | unknown, duration: number, delay: number, complete_function: unknown): void;
    function cancel_animations(url: string | Hash | Url, property: string | Hash): void;
    function exists(url: string | Hash | Url): boolean;
    function final(self: unknown): void;
    function fixed_update(self: unknown, dt: number): void;
    function get(url: string | Hash | Url, property: string | Hash, options: Record<string | number, unknown>): number | boolean | Hash | Url | Vector3 | Vector4 | Quaternion | unknown;
    function get_id(path: string): Hash;
    function get_parent(id: string | Hash | Url): Hash | unknown;
    function get_position(id: string | Hash | Url): Vector3;
    function get_rotation(id: string | Hash | Url): Quaternion;
    function get_scale(id: string | Hash | Url): Vector3;
    function get_scale_uniform(id: string | Hash | Url): number;
    function get_world_position(id: string | Hash | Url): Vector3;
    function get_world_rotation(id: string | Hash | Url): Quaternion;
    function get_world_scale(id: string | Hash | Url): Vector3;
    function get_world_scale_uniform(id: string | Hash | Url): number;
    function get_world_transform(id: string | Hash | Url): Matrix4;
    function init(self: unknown): void;
    function late_update(self: unknown, dt: number): void;
    function on_input(self: unknown, action_id: Hash, action: Record<string | number, unknown>): boolean | unknown;
    function on_message(self: unknown, message_id: Hash, message: Record<string | number, unknown>, sender: Url): void;
    function on_reload(self: unknown): void;
    function property(name: string, value: number | Hash | Url | Vector3 | Vector4 | Quaternion | unknown | boolean): void;
    function set(url: string | Hash | Url, property: string | Hash, value: number | boolean | Hash | Url | Vector3 | Vector4 | Quaternion | unknown, options: Record<string | number, unknown>): void;
    function set_parent(id: string | Hash | Url, parent_id: string | Hash | Url, keep_world_transform: boolean): void;
    function set_position(position: Vector3, id: string | Hash | Url): void;
    function set_rotation(rotation: Quaternion, id: string | Hash | Url): void;
    function set_scale(scale: number | Vector3, id: string | Hash | Url): void;
    function set_scale_xy(scale: number | Vector3, id: string | Hash | Url): void;
    function update(self: unknown, dt: number): void;
    function update_world_transform(id: string | Hash | Url): void;
    function world_to_local_position(position: Vector3, url: string | Hash | Url): Vector3;
    function world_to_local_transform(transformation: Matrix4, url: string | Hash | Url): Matrix4;
  }
}

export {};
