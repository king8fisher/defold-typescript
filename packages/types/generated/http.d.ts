/** @noSelfInFile */
declare global {
  namespace http {
    function request(url: string, method: string, callback: (self: unknown, id: unknown, response: unknown) => void, headers?: Record<string | number, unknown>, post_data?: string, options?: { timeout?: number; path?: string; ignore_cache?: boolean; chunked_transfer?: boolean; report_progress?: boolean }): void;
  }
}

export {};
