/** @noSelfInFile */
import type { Hash, Url } from "../src/core-types";

declare global {
  namespace sound {
    function get_group_gain(group: string | Hash): number;
    function get_group_name(group: string | Hash): string;
    function get_groups(): Hash[];
    function get_peak(group: string | Hash, window: number): LuaMultiReturn<[number, number]>;
    function get_rms(group: string | Hash, window: number): LuaMultiReturn<[number, number]>;
    function is_music_playing(): boolean;
    function is_phone_call_active(): boolean;
    function pause(url: string | Hash | Url, pause: boolean): void;
    function play(url: string | Hash | Url, play_properties?: { delay?: number; gain?: number; pan?: number; speed?: number; start_time?: number; start_frame?: number }, complete_function?: (self: unknown, message_id: unknown, message: unknown, sender: unknown) => void): number;
    function set_gain(url: string | Hash | Url, gain?: number): void;
    function set_group_gain(group: string | Hash, gain: number): void;
    function set_pan(url: string | Hash | Url, pan?: number): void;
    function stop(url: string | Hash | Url, stop_properties?: { play_id?: number }): void;
    interface properties {
      gain: number;
      pan: number;
      sound: Hash;
      speed: number;
    }
  }
}

export {};
