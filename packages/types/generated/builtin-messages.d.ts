import type { Hash, Matrix4, Vector3, Vector4 } from "../src/core-types";

declare global {
  interface BuiltinMessages {
    acquire_input_focus: Record<string, never>;
    animation_done: { current_tile: number; id: Hash };
    apply_force: { force: Vector3; position: Vector3 };
    async_load: Record<string, never>;
    clear_color: { color: Vector4 };
    collision_response: { other_id: Hash; other_position: Vector3; other_group: Hash; own_group: Hash };
    contact_point_response: { position: Vector3; normal: Vector3; relative_velocity: Vector3; distance: number; applied_impulse: number; life_time: number; mass: number; other_mass: number; other_id: Hash; other_position: Vector3; other_group: Hash; own_group: Hash };
    disable: Record<string, never>;
    draw_debug_text: { position: Vector3; text: string; color: Vector4 };
    draw_line: { start_point: Vector3; end_point: Vector3; color: Vector4 };
    enable: Record<string, never>;
    final: Record<string, never>;
    init: Record<string, never>;
    layout_changed: { id: Hash; previous_id: Hash };
    load: Record<string, never>;
    model_animation_done: { animation_id: Hash; playback: number };
    play_animation: { id: Hash };
    play_sound: { delay?: number; gain?: number; play_id?: number };
    proxy_loaded: Record<string, never>;
    proxy_unloaded: Record<string, never>;
    ray_cast_missed: { group: Hash; request_id: number };
    ray_cast_response: { fraction: number; position: Vector3; normal: Vector3; id: Hash; group: Hash; request_id: number };
    release_input_focus: Record<string, never>;
    set_gain: { gain: number };
    set_parent: { parent_id?: Hash; keep_world_transform?: 0 | 1 };
    set_time_step: { factor: number; mode: number };
    set_view_projection: { id: Hash; view: Matrix4; projection: Matrix4 };
    sound_done: { play_id: number };
    sound_stopped: { play_id: number };
    stop_sound: Record<string, never>;
    trigger_response: { other_id: Hash; enter: boolean; other_group: Hash; own_group: Hash };
    unload: Record<string, never>;
    window_resized: { height: number; width: number };
  }
  type BuiltinMessageId = keyof BuiltinMessages;
}

export {};
