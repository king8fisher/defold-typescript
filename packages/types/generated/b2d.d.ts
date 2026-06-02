/** @noSelfInFile */
import type { Hash, Opaque, Url } from "../src/core-types";

declare global {
  namespace b2d {
    type b2Body = Opaque<"b2Body">;
    type b2World = Opaque<"b2World">;
    function get_body(url: string | Hash | Url): Opaque<"b2Body">;
    function get_world(): Opaque<"b2World">;
  }
}

export {};
