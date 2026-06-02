/// <reference path="../index.d.ts" />

go.delete("my_instance");
go.delete("my_instance", true);

const _nullValue: unknown = json.null;
void _nullValue;

// @ts-expect-error the internal _delete alias target is not exposed publicly
go._delete("my_instance");

// @ts-expect-error the internal _null alias target is not exposed publicly
const _internalNull = json._null;
void _internalNull;
