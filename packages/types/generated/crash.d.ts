/** @noSelfInFile */
declare global {
  namespace crash {
    const SYSFIELD_ANDROID_BUILD_FINGERPRINT: number & { readonly __brand: "crash.SYSFIELD_ANDROID_BUILD_FINGERPRINT" };
    const SYSFIELD_DEVICE_LANGUAGE: number & { readonly __brand: "crash.SYSFIELD_DEVICE_LANGUAGE" };
    const SYSFIELD_DEVICE_MODEL: number & { readonly __brand: "crash.SYSFIELD_DEVICE_MODEL" };
    const SYSFIELD_ENGINE_HASH: number & { readonly __brand: "crash.SYSFIELD_ENGINE_HASH" };
    const SYSFIELD_ENGINE_VERSION: number & { readonly __brand: "crash.SYSFIELD_ENGINE_VERSION" };
    const SYSFIELD_LANGUAGE: number & { readonly __brand: "crash.SYSFIELD_LANGUAGE" };
    const SYSFIELD_MANUFACTURER: number & { readonly __brand: "crash.SYSFIELD_MANUFACTURER" };
    const SYSFIELD_MAX: number & { readonly __brand: "crash.SYSFIELD_MAX" };
    const SYSFIELD_SYSTEM_NAME: number & { readonly __brand: "crash.SYSFIELD_SYSTEM_NAME" };
    const SYSFIELD_SYSTEM_VERSION: number & { readonly __brand: "crash.SYSFIELD_SYSTEM_VERSION" };
    const SYSFIELD_TERRITORY: number & { readonly __brand: "crash.SYSFIELD_TERRITORY" };
    const USERFIELD_MAX: number & { readonly __brand: "crash.USERFIELD_MAX" };
    const USERFIELD_SIZE: number & { readonly __brand: "crash.USERFIELD_SIZE" };
    function get_backtrace(handle: number): Record<string | number, unknown>;
    function get_extra_data(handle: number): string;
    function get_modules(handle: number): Record<string | number, unknown>;
    function get_signum(handle: number): number;
    function get_sys_field(handle: number, index: number): string | unknown;
    function get_user_field(handle: number, index: number): string;
    function load_previous(): number | unknown;
    function release(handle: number): void;
    function set_file_path(path: string): void;
    function set_user_field(index: number, value: string): void;
    function write_dump(): void;
  }
}

export {};
