/** @noSelfInFile */
import type { Hash } from "./core-types";

declare global {
  // Receive-side mirror of `msg.post`'s send-side narrowing (msg-overloads.d.ts).
  // Defold delivers `message_id` as a pre-hashed `Hash`, so the literal a
  // discriminated union would need is gone; re-introducing it here lets the
  // untyped `message` record narrow to its `BuiltinMessages` payload. The
  // transpiler lowers the call to `message_id == hash("...")`
  // (message-guard-lowering.ts), keeping this package free of runtime Lua.
  function isMessage<K extends BuiltinMessageId>(
    message_id: Hash,
    message: Record<string | number, unknown>,
    expected: K,
  ): message is BuiltinMessages[K];
}
