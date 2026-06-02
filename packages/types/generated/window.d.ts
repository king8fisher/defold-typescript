/** @noSelfInFile */
import type { Opaque } from "../src/core-types";

declare global {
  namespace window {
    const DIMMING_OFF: number & { readonly __brand: "window.DIMMING_OFF" };
    const DIMMING_ON: number & { readonly __brand: "window.DIMMING_ON" };
    const DIMMING_UNKNOWN: number & { readonly __brand: "window.DIMMING_UNKNOWN" };
    const WINDOW_EVENT_DEICONIFIED: number & { readonly __brand: "window.WINDOW_EVENT_DEICONIFIED" };
    const WINDOW_EVENT_FOCUS_GAINED: number & { readonly __brand: "window.WINDOW_EVENT_FOCUS_GAINED" };
    const WINDOW_EVENT_FOCUS_LOST: number & { readonly __brand: "window.WINDOW_EVENT_FOCUS_LOST" };
    const WINDOW_EVENT_ICONFIED: number & { readonly __brand: "window.WINDOW_EVENT_ICONFIED" };
    const WINDOW_EVENT_RESIZED: number & { readonly __brand: "window.WINDOW_EVENT_RESIZED" };
    function get_dim_mode(): Opaque<"constant">;
    function get_display_scale(): number;
    function get_mouse_lock(): boolean;
    function get_safe_area(): { safe_area: { x: number; y: number; width: number; height: number; inset_left: number; inset_top: number; inset_right: number; inset_bottom: number } };
    function get_size(): LuaMultiReturn<[number, number]>;
    function set_dim_mode(mode: Opaque<"constant">): void;
    function set_listener(callback?: (self: unknown, event: unknown, data: unknown) => void): void;
    function set_mouse_lock(flag: boolean): void;
    function set_position(x: number, y: number): void;
    function set_size(width: number, height: number): void;
    function set_title(title: string): void;
  }
}

export {};
