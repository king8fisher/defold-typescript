/** @noSelfInFile */
import type { Hash, Url, Vector3 } from "../src/core-types";

declare global {
  namespace physics {
    const JOINT_TYPE_FIXED: number & { readonly __brand: "physics.JOINT_TYPE_FIXED" };
    const JOINT_TYPE_HINGE: number & { readonly __brand: "physics.JOINT_TYPE_HINGE" };
    const JOINT_TYPE_SLIDER: number & { readonly __brand: "physics.JOINT_TYPE_SLIDER" };
    const JOINT_TYPE_SPRING: number & { readonly __brand: "physics.JOINT_TYPE_SPRING" };
    const JOINT_TYPE_WELD: number & { readonly __brand: "physics.JOINT_TYPE_WELD" };
    const JOINT_TYPE_WHEEL: number & { readonly __brand: "physics.JOINT_TYPE_WHEEL" };
    const SHAPE_TYPE_BOX: number & { readonly __brand: "physics.SHAPE_TYPE_BOX" };
    const SHAPE_TYPE_CAPSULE: number & { readonly __brand: "physics.SHAPE_TYPE_CAPSULE" };
    const SHAPE_TYPE_HULL: number & { readonly __brand: "physics.SHAPE_TYPE_HULL" };
    const SHAPE_TYPE_SPHERE: number & { readonly __brand: "physics.SHAPE_TYPE_SPHERE" };
    function create_joint(joint_type: number, collisionobject_a: string | Hash | Url, joint_id: string | Hash, position_a: Vector3, collisionobject_b: string | Hash | Url, position_b: Vector3, properties?: Record<string | number, unknown>): void;
    function destroy_joint(collisionobject: string | Hash | Url, joint_id: string | Hash): void;
    function get_gravity(): Vector3;
    function get_group(url: string | Hash | Url): Hash;
    function get_joint_properties(collisionobject: string | Hash | Url, joint_id: string | Hash): { collide_connected: boolean };
    function get_joint_reaction_force(collisionobject: string | Hash | Url, joint_id: string | Hash): Vector3;
    function get_joint_reaction_torque(collisionobject: string | Hash | Url, joint_id: string | Hash): number;
    function get_maskbit(url: string | Hash | Url, group: string): boolean;
    function get_shape(url: string | Hash | Url, shape: string | Hash): { type: number; diameter: number; dimensions: Vector3; diameter: number; height: number };
    function raycast(from: Vector3, to: Vector3, groups: Record<string | number, unknown>, options?: { all?: boolean }): Record<string | number, unknown> | unknown;
    function raycast_async(from: Vector3, to: Vector3, groups: Record<string | number, unknown>, request_id?: number): void;
    function set_event_listener(callback?: (self: unknown, events: unknown) => void): void;
    function set_gravity(gravity: Vector3): void;
    function set_group(url: string | Hash | Url, group: string): void;
    function set_hflip(url: string | Hash | Url, flip: boolean): void;
    function set_joint_properties(collisionobject: string | Hash | Url, joint_id: string | Hash, properties: Record<string | number, unknown>): void;
    function set_maskbit(url: string | Hash | Url, group: string, maskbit: boolean): void;
    function set_shape(url: string | Hash | Url, shape: string | Hash, table: { type?: number; diameter?: number; dimensions?: Vector3; diameter?: number; height?: number }): void;
    function set_vflip(url: string | Hash | Url, flip: boolean): void;
    function update_mass(collisionobject: string | Hash | Url, mass: number): void;
    function wakeup(url: string | Hash | Url): void;
    interface properties {
      angular_damping: number;
      angular_velocity: Vector3;
      linear_damping: number;
      linear_velocity: Vector3;
      mass: number;
    }
  }
}

export {};
