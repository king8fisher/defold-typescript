/** @noSelfInFile */
// Defold globals this example needs that @defold-typescript/types does not yet
// declare. Every entry here is an upstream gap surfaced by converting
// vendor/template-platformer; delete each line as the types package grows.
// @noSelfInFile makes these emit as plain calls (hash("x"), math.abs(n)),
// not self-passing colon/_G calls.

// Pulls in the ambient .script surface (go, vmath, msg, sprite, ...) for the
// editor / standalone tsc. The transpiler seeds these namespaces itself and
// resolves this specifier to an empty stub, so the import is harmless there.
import "@defold-typescript/types/script";

declare global {
  // hash(): the universal Defold builtin every script uses to intern ids.
  // Not declared upstream yet — its own slice.
  function hash(s: string): import("@defold-typescript/types").Hash;
}
