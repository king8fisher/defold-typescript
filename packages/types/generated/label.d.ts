/** @noSelfInFile */
import type { Hash, Url, Vector3, Vector4 } from "../src/core-types";

declare global {
  namespace label {
    function get_text(url: string | Hash | Url): string;
    function set_text(url: string | Hash | Url, text: string | number): void;
    interface properties {
      color: Vector4;
      font: Hash;
      leading: number;
      line_break: boolean;
      material: Hash;
      outline: Vector4;
      scale: number | Vector3;
      shadow: Vector4;
      size: Vector3;
      tracking: number;
    }
  }
}

export {};
