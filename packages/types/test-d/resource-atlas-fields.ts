/// <reference path="../index.d.ts" />

type CreateAtlasOptions = Parameters<typeof resource.create_atlas>[1];
declare const options: CreateAtlasOptions;

const _fps: number | undefined = options.animations?.[0]?.fps;
void _fps;

// @ts-expect-error not_a_key is not a recovered atlas animation field
const _bad = options.animations?.[0]?.not_a_key;
void _bad;
