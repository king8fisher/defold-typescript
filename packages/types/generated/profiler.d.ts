/** @noSelfInFile */
import type { Opaque } from "../src/core-types";

declare global {
  namespace profiler {
    const MODE_PAUSE: number & { readonly __brand: "profiler.MODE_PAUSE" };
    const MODE_RECORD: number & { readonly __brand: "profiler.MODE_RECORD" };
    const MODE_RUN: number & { readonly __brand: "profiler.MODE_RUN" };
    const MODE_SHOW_PEAK_FRAME: number & { readonly __brand: "profiler.MODE_SHOW_PEAK_FRAME" };
    const VIEW_MODE_FULL: number & { readonly __brand: "profiler.VIEW_MODE_FULL" };
    const VIEW_MODE_MINIMIZED: number & { readonly __brand: "profiler.VIEW_MODE_MINIMIZED" };
    function dump_frame(): void;
    function enable(enabled: boolean): void;
    function enable_ui(enabled: boolean): void;
    function get_cpu_usage(): number;
    function get_memory_usage(): number;
    function log_text(text: string): void;
    function recorded_frame_count(): number;
    function scope_begin(name: string): void;
    function scope_end(): void;
    function set_ui_mode(mode: Opaque<"constant">): void;
    function set_ui_view_mode(mode: Opaque<"constant">): void;
    function set_ui_vsync_wait_visible(visible: boolean): void;
    function view_recorded_frame(frame_index: Record<string | number, unknown>): void;
  }
}

export {};
