/** @noSelfInFile */
import type { Hash, Url, Vector3, Vector4 } from "../src/core-types";

declare global {
  namespace sprite {
    function play_flipbook(url: string | Hash | Url, id: string | Hash, complete_function?: (self: unknown, message_id: unknown, message: unknown, sender: unknown) => void, play_properties?: { offset?: number; playback_rate?: number }): void;
    function set_hflip(url: string | Hash | Url, flip: boolean): void;
    function set_vflip(url: string | Hash | Url, flip: boolean): void;
    interface properties {
      animation: Hash;
      cursor: number;
      frame_count: Hash;
      image: Hash;
      material: Hash;
      playback_rate: number;
      scale: Vector3;
      size: Vector3;
      slice: Vector4;
    }
  }
}

export {};
