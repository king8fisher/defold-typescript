/// <reference path="../index.d.ts" />

// The two prose-only "table (array) of id(s)" slots are array shapes the field
// parser cannot read; their element token(s) are hand-curated in
// HOMOGENEOUS_ARRAY_SLOTS and emitted as a plain array. iap.list's element is the
// single token `string`; go.delete's is the id union `string | hash | url`,
// emitted `(string | Hash | Url)[]`.

// iap.list accepts a string[] of product identifiers.
iap.list(["sku.a", "sku.b"], () => {});

// @ts-expect-error iap.list wants a string[], not a number[]
iap.list([1, 2], () => {});

// go.delete accepts a Hash[] — a hash is one member of the id union (group ids
// returned by sound.get_groups are Hash, the engine's id type).
const ids = sound.get_groups();
go.delete(ids);

// The scalar id form still type-checks (the union's non-array members).
go.delete(ids[0]);

// @ts-expect-error go.delete's array element is an id union, not a number.
go.delete([1, 2]);
