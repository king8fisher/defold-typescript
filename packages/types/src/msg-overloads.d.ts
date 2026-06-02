/** @noSelfInFile */
import type { Hash, Url } from "./core-types";

type MsgPostPayload<K> = K extends BuiltinMessageId
  ? BuiltinMessages[K]
  : Record<string | number, unknown>;

declare global {
  namespace msg {
    function post<K extends string>(
      receiver: string | Url | Hash,
      message_id: K,
      message?: MsgPostPayload<K>,
    ): void;
    function post(
      receiver: string | Url | Hash,
      message_id: Hash,
      message?: Record<string | number, unknown>,
    ): void;
  }
}
