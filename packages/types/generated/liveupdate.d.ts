/** @noSelfInFile */
declare global {
  namespace liveupdate {
    const LIVEUPDATE_BUNDLED_RESOURCE_MISMATCH: number & { readonly __brand: "liveupdate.LIVEUPDATE_BUNDLED_RESOURCE_MISMATCH" };
    const LIVEUPDATE_ENGINE_VERSION_MISMATCH: number & { readonly __brand: "liveupdate.LIVEUPDATE_ENGINE_VERSION_MISMATCH" };
    const LIVEUPDATE_FORMAT_ERROR: number & { readonly __brand: "liveupdate.LIVEUPDATE_FORMAT_ERROR" };
    const LIVEUPDATE_INVAL: number & { readonly __brand: "liveupdate.LIVEUPDATE_INVAL" };
    const LIVEUPDATE_INVALID_HEADER: number & { readonly __brand: "liveupdate.LIVEUPDATE_INVALID_HEADER" };
    const LIVEUPDATE_INVALID_RESOURCE: number & { readonly __brand: "liveupdate.LIVEUPDATE_INVALID_RESOURCE" };
    const LIVEUPDATE_IO_ERROR: number & { readonly __brand: "liveupdate.LIVEUPDATE_IO_ERROR" };
    const LIVEUPDATE_MEM_ERROR: number & { readonly __brand: "liveupdate.LIVEUPDATE_MEM_ERROR" };
    const LIVEUPDATE_OK: number & { readonly __brand: "liveupdate.LIVEUPDATE_OK" };
    const LIVEUPDATE_SCHEME_MISMATCH: number & { readonly __brand: "liveupdate.LIVEUPDATE_SCHEME_MISMATCH" };
    const LIVEUPDATE_SIGNATURE_MISMATCH: number & { readonly __brand: "liveupdate.LIVEUPDATE_SIGNATURE_MISMATCH" };
    const LIVEUPDATE_UNKNOWN: number & { readonly __brand: "liveupdate.LIVEUPDATE_UNKNOWN" };
    const LIVEUPDATE_VERSION_MISMATCH: number & { readonly __brand: "liveupdate.LIVEUPDATE_VERSION_MISMATCH" };
    function add_mount(name: string, uri: string, priority: number, callback: (...args: unknown[]) => unknown): number;
    function get_mounts(): Record<string | number, unknown>;
    function remove_mount(name: string): number;
  }
}

export {};
