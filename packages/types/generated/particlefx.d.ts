/** @noSelfInFile */
import type { Hash, Url, Vector4 } from "../src/core-types";

declare global {
  namespace particlefx {
    const EMITTER_STATE_POSTSPAWN: number & { readonly __brand: "particlefx.EMITTER_STATE_POSTSPAWN" };
    const EMITTER_STATE_PRESPAWN: number & { readonly __brand: "particlefx.EMITTER_STATE_PRESPAWN" };
    const EMITTER_STATE_SLEEPING: number & { readonly __brand: "particlefx.EMITTER_STATE_SLEEPING" };
    const EMITTER_STATE_SPAWNING: number & { readonly __brand: "particlefx.EMITTER_STATE_SPAWNING" };
    function play(url: string | Hash | Url, emitter_state_function?: (self: unknown, id: unknown, emitter: unknown, state: unknown) => void): void;
    function reset_constant(url: string | Hash | Url, emitter: string | Hash, constant: string | Hash): void;
    function set_constant(url: string | Hash | Url, emitter: string | Hash, constant: string | Hash, value: Vector4): void;
    function stop(url: string | Hash | Url, options?: { clear?: boolean }): void;
    interface properties {
      animation: Hash;
      image: Hash;
      material: Hash;
    }
  }
}

export {};
