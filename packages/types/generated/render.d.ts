/** @noSelfInFile */
import type { Hash, Matrix4, Opaque, Url } from "../src/core-types";

declare global {
  namespace render {
    type constant_buffer = Opaque<"constant_buffer">;
    type render_target = Opaque<"render_target">;
    type texture = Opaque<"texture">;
    const FRUSTUM_PLANES_ALL: number & { readonly __brand: "render.FRUSTUM_PLANES_ALL" };
    const FRUSTUM_PLANES_SIDES: number & { readonly __brand: "render.FRUSTUM_PLANES_SIDES" };
    const RENDER_TARGET_DEFAULT: number & { readonly __brand: "render.RENDER_TARGET_DEFAULT" };
    const SORT_BACK_TO_FRONT: number & { readonly __brand: "render.SORT_BACK_TO_FRONT" };
    const SORT_FRONT_TO_BACK: number & { readonly __brand: "render.SORT_FRONT_TO_BACK" };
    const SORT_NONE: number & { readonly __brand: "render.SORT_NONE" };
    function clear(buffers: Record<string | number, unknown>): void;
    function constant_buffer(): Opaque<"constant_buffer">;
    function delete_render_target(render_target: Opaque<"render_target">): void;
    function disable_material(): void;
    function disable_state(state: Opaque<"constant">): void;
    function disable_texture(binding: Opaque<"texture"> | string | Hash): void;
    function dispatch_compute(x: number, y: number, z: number, options?: { constants?: Opaque<"constant_buffer"> }): void;
    function draw(predicate: number, options?: { frustum?: Matrix4; frustum_planes?: number; constants?: Opaque<"constant_buffer">; sort_order?: number }): void;
    function draw_debug3d(options?: { frustum?: Matrix4; frustum_planes?: number }): void;
    function enable_material(material_id: string | Hash): void;
    function enable_state(state: Opaque<"constant">): void;
    function enable_texture(binding: number | string | Hash, handle_or_name: Opaque<"texture"> | string | Hash, buffer_type?: number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR0_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR1_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR2_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR3_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_DEPTH_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_STENCIL_BIT" }): void;
    function get_height(): number;
    function get_render_target_height(render_target: Opaque<"render_target">, buffer_type: number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR0_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR1_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR2_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR3_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_DEPTH_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_STENCIL_BIT" }): number;
    function get_render_target_width(render_target: Opaque<"render_target">, buffer_type: number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR0_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR1_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR2_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_COLOR3_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_DEPTH_BIT" } | number & { readonly __brand: "graphics.BUFFER_TYPE_STENCIL_BIT" }): number;
    function get_width(): number;
    function get_window_height(): number;
    function get_window_width(): number;
    function predicate(tags: Record<string | number, unknown>): number;
    function render_target(name: string, parameters: Record<string | number, unknown>): Opaque<"render_target">;
    function set_blend_func(source_factor: number, destination_factor: number): void;
    function set_camera(camera?: Url | number, options?: { use_frustum?: boolean }): void;
    function set_color_mask(red: boolean, green: boolean, blue: boolean, alpha: boolean): void;
    function set_compute(compute?: string | Hash): void;
    function set_cull_face(face_type: number): void;
    function set_depth_func(func: number): void;
    function set_depth_mask(depth: boolean): void;
    function set_listener(callback?: (self: unknown, event_type: unknown) => void): void;
    function set_polygon_offset(factor: number, units: number): void;
    function set_projection(matrix: Matrix4): void;
    function set_render_target(render_target: Opaque<"render_target">, options?: { transient?: Record<string | number, unknown> }): void;
    function set_render_target_size(render_target: Opaque<"render_target">, width: number, height: number): void;
    function set_stencil_func(func: number, ref: number, mask: number): void;
    function set_stencil_mask(mask: number): void;
    function set_stencil_op(sfail: number, dpfail: number, dppass: number): void;
    function set_view(matrix: Matrix4): void;
    function set_viewport(x: number, y: number, width: number, height: number): void;
  }
}

export {};
