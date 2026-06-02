/** @noSelfInFile */
declare global {
  namespace webview {
    function create(callback: (...args: unknown[]) => unknown): void;
    function destroy(webview_id: number): void;
    function eval(webview_id: number, code: string): void;
    function is_visible(webview_id: number): void;
    function open_raw(webview_id: number, html: string, options: Record<string | number, unknown>): void;
    function set_position(webview_id: number, x: number, y: number, width: number, height: number): void;
    function set_transparent(webview_id: number, transparent: boolean): void;
    function set_visible(webview_id: number, visible: number): void;
  }
}

export {};
