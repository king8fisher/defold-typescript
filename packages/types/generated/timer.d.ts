/** @noSelfInFile */
declare global {
  namespace timer {
    const INVALID_TIMER_HANDLE: number & { readonly __brand: "timer.INVALID_TIMER_HANDLE" };
    function cancel(handle: number): boolean;
    function delay(delay: number, repeating: boolean, callback: (self: unknown, handle: unknown, time_elapsed: unknown) => void): number;
    function get_info(handle: number): { time_remaining: number; delay: number; repeating: boolean } | unknown;
    function trigger(handle: number): boolean;
  }
}

export {};
