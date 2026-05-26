import type { Hash, Url } from "../src/core-types";

declare global {
  namespace msg {
    function post(receiver: string | Url | Hash, message_id: string | Hash, message?: Record<string | number, unknown>): void;
    function url(): Url;
    function url(urlstring: string): Url;
    function url(socket: string | Hash, path: string | Hash, fragment: string | Hash): Url;
  }
}

export {};
