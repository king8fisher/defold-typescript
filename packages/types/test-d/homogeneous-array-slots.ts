/// <reference path="../index.d.ts" />

import type { Hash } from "../src/core-types";

// The four homogeneous-primitive array slots are prose-only `array/list/table of
// T` shapes the field parser cannot read; their element type is hand-curated in
// HOMOGENEOUS_ARRAY_SLOTS and emitted as `T[]` — a plain array carries no
// illegal-index-key problem, so no LuaMap is needed.

// vmath.vector accepts a number[].
const v = vmath.vector([1, 2, 3]);
void v;

// @ts-expect-error vmath.vector wants a number[], not a string[]
vmath.vector(["a", "b"]);

// sound.get_groups returns Hash[]; each element is a Hash that feeds a group gain
// query (group ids are hashes).
const groups = sound.get_groups();
for (const group of groups) {
  const gain: number = sound.get_group_gain(group);
  void gain;
}

// The element type is Hash, not string.
const [firstGroup] = groups;
const checkFirst: Hash | undefined = firstGroup;
void checkFirst;

// @ts-expect-error get_groups returns Hash[], so an element is not a string.
const wrongElement: string = groups[0];
void wrongElement;
