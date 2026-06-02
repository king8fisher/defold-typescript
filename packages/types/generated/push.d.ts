/** @noSelfInFile */
declare global {
  namespace push {
    function cancel(id: number): void;
    function cancel_all_issued(): void;
    function get_all_scheduled(): Record<string | number, unknown>;
    function get_scheduled(id: number): Record<string | number, unknown>;
    function register(notifications: Record<string | number, unknown>, callback: (...args: unknown[]) => unknown): void;
    function schedule(time: number, title: string, alert: string, payload: string, notification_settings: Record<string | number, unknown>): LuaMultiReturn<[number, string]>;
    function set_badge_count(count: number): void;
    function set_listener(listener: (...args: unknown[]) => unknown): void;
  }
}

export {};
