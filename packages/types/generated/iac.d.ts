/** @noSelfInFile */
declare global {
  namespace iac {
    function set_listener(payload: Record<string | number, unknown>, type: number): void;
  }
}

export {};
