/** @noSelfInFile */
import type { Hash, Matrix4, Opaque, Quaternion, Url, Vector, Vector3, Vector4 } from "../src/core-types";

declare global {
  namespace go {
    export const EASING_INBACK: number & { readonly __brand: "go.EASING_INBACK" };
    export const EASING_INBOUNCE: number & { readonly __brand: "go.EASING_INBOUNCE" };
    export const EASING_INCIRC: number & { readonly __brand: "go.EASING_INCIRC" };
    export const EASING_INCUBIC: number & { readonly __brand: "go.EASING_INCUBIC" };
    export const EASING_INELASTIC: number & { readonly __brand: "go.EASING_INELASTIC" };
    export const EASING_INEXPO: number & { readonly __brand: "go.EASING_INEXPO" };
    export const EASING_INOUTBACK: number & { readonly __brand: "go.EASING_INOUTBACK" };
    export const EASING_INOUTBOUNCE: number & { readonly __brand: "go.EASING_INOUTBOUNCE" };
    export const EASING_INOUTCIRC: number & { readonly __brand: "go.EASING_INOUTCIRC" };
    export const EASING_INOUTCUBIC: number & { readonly __brand: "go.EASING_INOUTCUBIC" };
    export const EASING_INOUTELASTIC: number & { readonly __brand: "go.EASING_INOUTELASTIC" };
    export const EASING_INOUTEXPO: number & { readonly __brand: "go.EASING_INOUTEXPO" };
    export const EASING_INOUTQUAD: number & { readonly __brand: "go.EASING_INOUTQUAD" };
    export const EASING_INOUTQUART: number & { readonly __brand: "go.EASING_INOUTQUART" };
    export const EASING_INOUTQUINT: number & { readonly __brand: "go.EASING_INOUTQUINT" };
    export const EASING_INOUTSINE: number & { readonly __brand: "go.EASING_INOUTSINE" };
    export const EASING_INQUAD: number & { readonly __brand: "go.EASING_INQUAD" };
    export const EASING_INQUART: number & { readonly __brand: "go.EASING_INQUART" };
    export const EASING_INQUINT: number & { readonly __brand: "go.EASING_INQUINT" };
    export const EASING_INSINE: number & { readonly __brand: "go.EASING_INSINE" };
    export const EASING_LINEAR: number & { readonly __brand: "go.EASING_LINEAR" };
    export const EASING_OUTBACK: number & { readonly __brand: "go.EASING_OUTBACK" };
    export const EASING_OUTBOUNCE: number & { readonly __brand: "go.EASING_OUTBOUNCE" };
    export const EASING_OUTCIRC: number & { readonly __brand: "go.EASING_OUTCIRC" };
    export const EASING_OUTCUBIC: number & { readonly __brand: "go.EASING_OUTCUBIC" };
    export const EASING_OUTELASTIC: number & { readonly __brand: "go.EASING_OUTELASTIC" };
    export const EASING_OUTEXPO: number & { readonly __brand: "go.EASING_OUTEXPO" };
    export const EASING_OUTINBACK: number & { readonly __brand: "go.EASING_OUTINBACK" };
    export const EASING_OUTINBOUNCE: number & { readonly __brand: "go.EASING_OUTINBOUNCE" };
    export const EASING_OUTINCIRC: number & { readonly __brand: "go.EASING_OUTINCIRC" };
    export const EASING_OUTINCUBIC: number & { readonly __brand: "go.EASING_OUTINCUBIC" };
    export const EASING_OUTINELASTIC: number & { readonly __brand: "go.EASING_OUTINELASTIC" };
    export const EASING_OUTINEXPO: number & { readonly __brand: "go.EASING_OUTINEXPO" };
    export const EASING_OUTINQUAD: number & { readonly __brand: "go.EASING_OUTINQUAD" };
    export const EASING_OUTINQUART: number & { readonly __brand: "go.EASING_OUTINQUART" };
    export const EASING_OUTINQUINT: number & { readonly __brand: "go.EASING_OUTINQUINT" };
    export const EASING_OUTINSINE: number & { readonly __brand: "go.EASING_OUTINSINE" };
    export const EASING_OUTQUAD: number & { readonly __brand: "go.EASING_OUTQUAD" };
    export const EASING_OUTQUART: number & { readonly __brand: "go.EASING_OUTQUART" };
    export const EASING_OUTQUINT: number & { readonly __brand: "go.EASING_OUTQUINT" };
    export const EASING_OUTSINE: number & { readonly __brand: "go.EASING_OUTSINE" };
    export const PLAYBACK_LOOP_BACKWARD: number & { readonly __brand: "go.PLAYBACK_LOOP_BACKWARD" };
    export const PLAYBACK_LOOP_FORWARD: number & { readonly __brand: "go.PLAYBACK_LOOP_FORWARD" };
    export const PLAYBACK_LOOP_PINGPONG: number & { readonly __brand: "go.PLAYBACK_LOOP_PINGPONG" };
    export const PLAYBACK_NONE: number & { readonly __brand: "go.PLAYBACK_NONE" };
    export const PLAYBACK_ONCE_BACKWARD: number & { readonly __brand: "go.PLAYBACK_ONCE_BACKWARD" };
    export const PLAYBACK_ONCE_FORWARD: number & { readonly __brand: "go.PLAYBACK_ONCE_FORWARD" };
    export const PLAYBACK_ONCE_PINGPONG: number & { readonly __brand: "go.PLAYBACK_ONCE_PINGPONG" };
    export function animate(url: string | Hash | Url, property: string | Hash, playback: number & { readonly __brand: "go.PLAYBACK_ONCE_FORWARD" } | number & { readonly __brand: "go.PLAYBACK_ONCE_BACKWARD" } | number & { readonly __brand: "go.PLAYBACK_ONCE_PINGPONG" } | number & { readonly __brand: "go.PLAYBACK_LOOP_FORWARD" } | number & { readonly __brand: "go.PLAYBACK_LOOP_BACKWARD" } | number & { readonly __brand: "go.PLAYBACK_LOOP_PINGPONG" }, to: number | Vector3 | Vector4 | Quaternion, easing: Vector | number & { readonly __brand: "go.EASING_INBACK" } | number & { readonly __brand: "go.EASING_INBOUNCE" } | number & { readonly __brand: "go.EASING_INCIRC" } | number & { readonly __brand: "go.EASING_INCUBIC" } | number & { readonly __brand: "go.EASING_INELASTIC" } | number & { readonly __brand: "go.EASING_INEXPO" } | number & { readonly __brand: "go.EASING_INOUTBACK" } | number & { readonly __brand: "go.EASING_INOUTBOUNCE" } | number & { readonly __brand: "go.EASING_INOUTCIRC" } | number & { readonly __brand: "go.EASING_INOUTCUBIC" } | number & { readonly __brand: "go.EASING_INOUTELASTIC" } | number & { readonly __brand: "go.EASING_INOUTEXPO" } | number & { readonly __brand: "go.EASING_INOUTQUAD" } | number & { readonly __brand: "go.EASING_INOUTQUART" } | number & { readonly __brand: "go.EASING_INOUTQUINT" } | number & { readonly __brand: "go.EASING_INOUTSINE" } | number & { readonly __brand: "go.EASING_INQUAD" } | number & { readonly __brand: "go.EASING_INQUART" } | number & { readonly __brand: "go.EASING_INQUINT" } | number & { readonly __brand: "go.EASING_INSINE" } | number & { readonly __brand: "go.EASING_LINEAR" } | number & { readonly __brand: "go.EASING_OUTBACK" } | number & { readonly __brand: "go.EASING_OUTBOUNCE" } | number & { readonly __brand: "go.EASING_OUTCIRC" } | number & { readonly __brand: "go.EASING_OUTCUBIC" } | number & { readonly __brand: "go.EASING_OUTELASTIC" } | number & { readonly __brand: "go.EASING_OUTEXPO" } | number & { readonly __brand: "go.EASING_OUTINBACK" } | number & { readonly __brand: "go.EASING_OUTINBOUNCE" } | number & { readonly __brand: "go.EASING_OUTINCIRC" } | number & { readonly __brand: "go.EASING_OUTINCUBIC" } | number & { readonly __brand: "go.EASING_OUTINELASTIC" } | number & { readonly __brand: "go.EASING_OUTINEXPO" } | number & { readonly __brand: "go.EASING_OUTINQUAD" } | number & { readonly __brand: "go.EASING_OUTINQUART" } | number & { readonly __brand: "go.EASING_OUTINQUINT" } | number & { readonly __brand: "go.EASING_OUTINSINE" } | number & { readonly __brand: "go.EASING_OUTQUAD" } | number & { readonly __brand: "go.EASING_OUTQUART" } | number & { readonly __brand: "go.EASING_OUTQUINT" } | number & { readonly __brand: "go.EASING_OUTSINE" }, duration: number, delay?: number, complete_function?: (self: unknown, url: unknown, property: unknown) => void): void;
    export function cancel_animations(url: string | Hash | Url, property?: string | Hash): void;
    function _delete(id?: string | Hash | Url | (string | Hash | Url)[], recursive?: boolean): void;
    export function exists(url: string | Hash | Url): boolean;
    export function final(self: Opaque<"userdata">): void;
    export function fixed_update(self: Opaque<"userdata">, dt: number): void;
    export function get_id(path?: string): Hash;
    export function get_parent(id?: string | Hash | Url): Hash | unknown;
    export function get_position(id?: string | Hash | Url): Vector3;
    export function get_rotation(id?: string | Hash | Url): Quaternion;
    export function get_scale(id?: string | Hash | Url): Vector3;
    export function get_scale_uniform(id?: string | Hash | Url): number;
    export function get_world_position(id?: string | Hash | Url): Vector3;
    export function get_world_rotation(id?: string | Hash | Url): Quaternion;
    export function get_world_scale(id?: string | Hash | Url): Vector3;
    export function get_world_scale_uniform(id?: string | Hash | Url): number;
    export function get_world_transform(id?: string | Hash | Url): Matrix4;
    export function init(self: Opaque<"userdata">): void;
    export function late_update(self: Opaque<"userdata">, dt: number): void;
    export function on_input(self: Opaque<"userdata">, action_id: Hash, action: Record<string | number, unknown>): boolean | unknown;
    export function on_message(self: Opaque<"userdata">, message_id: Hash, message: Record<string | number, unknown>, sender: Url): void;
    export function on_reload(self: Opaque<"userdata">): void;
    export function property(name: string, value: number | Hash | Url | Vector3 | Vector4 | Quaternion | Opaque<"resource"> | boolean): void;
    export function set_parent(id?: string | Hash | Url, parent_id?: string | Hash | Url, keep_world_transform?: boolean): void;
    export function set_position(position: Vector3, id?: string | Hash | Url): void;
    export function set_rotation(rotation: Quaternion, id?: string | Hash | Url): void;
    export function set_scale(scale: number | Vector3, id?: string | Hash | Url): void;
    export function set_scale_xy(scale: number | Vector3, id?: string | Hash | Url): void;
    export function update(self: Opaque<"userdata">, dt: number): void;
    export function update_world_transform(id?: string | Hash | Url): void;
    export function world_to_local_position(position: Vector3, url: string | Hash | Url): Vector3;
    export function world_to_local_transform(transformation: Matrix4, url: string | Hash | Url): Matrix4;
    export { _delete as delete };
    export interface properties {
      euler: Vector3;
      position: Vector3;
      rotation: Quaternion;
      scale: number;
    }
  }
}

export {};
