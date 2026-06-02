/// <reference path="../index.d.ts" />

import type { Hash, Opaque, Vector3 } from "../src/core-types";

// The three gui mapping-table returns are prose-only `a table mapping X to Y`
// shapes the field parser cannot read; their key/value are hand-curated in
// MAPPING_TABLE_SLOTS and emitted as `LuaMap<K, V>` — a branded `Hash` key is
// illegal in a TS index signature. `.get(id)` yields the recovered value type.

declare const nodeId: Hash;

const tree = gui.get_tree(gui.get_node("root"));
const treeNode: Opaque<"node"> | undefined = tree.get(nodeId);
void treeNode;

const clones = gui.clone_tree(gui.get_node("button"));
const clonedNode: Opaque<"node"> | undefined = clones.get(nodeId);
void clonedNode;

const layouts = gui.get_layouts();
const size: Vector3 | undefined = layouts.get(nodeId);
void size;

// @ts-expect-error a layout value is a Vector3, not directly assignable to number
const _badSize: number = gui.get_layouts().get(nodeId);
