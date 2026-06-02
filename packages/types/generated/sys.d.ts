/** @noSelfInFile */
import type { Opaque } from "../src/core-types";

declare global {
  namespace sys {
    const NETWORK_CONNECTED: number & { readonly __brand: "sys.NETWORK_CONNECTED" };
    const NETWORK_CONNECTED_CELLULAR: number & { readonly __brand: "sys.NETWORK_CONNECTED_CELLULAR" };
    const NETWORK_DISCONNECTED: number & { readonly __brand: "sys.NETWORK_DISCONNECTED" };
    function deserialize(buffer: string): Record<string | number, unknown>;
    function exists(path: string): boolean;
    function exit(code: number): void;
    function get_application_info(app_string: string): { installed: boolean };
    function get_application_path(): string;
    function get_config_boolean(key: string, default_value?: boolean): boolean;
    function get_config_int(key: string, default_value?: number): number;
    function get_config_number(key: string, default_value?: number): number;
    function get_config_string(key: string, default_value?: string): string;
    function get_connectivity(): Opaque<"constant">;
    function get_engine_info(): { version: string; version_sha1: string; is_debug: boolean };
    function get_host_path(filename: string): string;
    function get_ifaddrs(): { name: string; address: string; mac: string; up: boolean; running: boolean }[];
    function get_save_file(application_id: string, file_name: string): string;
    function get_sys_info(options?: { ignore_secure?: boolean }): { device_model: string; manufacturer: string; system_name: string; system_version: string; api_version: string; language: string; device_language: string; territory: string; gmt_offset: number; device_ident: string; user_agent: string };
    function load(filename: string): Record<string | number, unknown>;
    function load_resource(filename: string): LuaMultiReturn<[string | unknown, string | unknown]>;
    function open_url(url: string, attributes?: { target?: string }): boolean;
    function reboot(arg1?: string, arg2?: string, arg3?: string, arg4?: string, arg5?: string, arg6?: string): void;
    function save(filename: string, table: Record<string | number, unknown>): void;
    function serialize(table: Record<string | number, unknown>): string;
    function set_connectivity_host(host: string): void;
    function set_error_handler(error_handler: (source: unknown, message: unknown, traceback: unknown) => void): void;
    function set_update_frequency(frequency: number): void;
    function set_vsync_swap_interval(swap_interval: number): void;
  }
}

export {};
