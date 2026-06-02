/** @noSelfInFile */
declare global {
  namespace zlib {
    function deflate(buf: string): string;
    function inflate(buf: string): string;
  }
}

export {};
