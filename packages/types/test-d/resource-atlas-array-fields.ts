/// <reference path="../index.d.ts" />

declare const path: string;

const arrayAtlas = resource.get_atlas(path);

const _firstAnim = arrayAtlas.animations[0];
if (_firstAnim) {
  const _firstAnimId: string = _firstAnim.id;
  void _firstAnimId;
}

// @ts-expect-error animations is an array of animation objects, not a single object
const _wrong: string = arrayAtlas.animations.id;
void _wrong;

type CreateAtlasArrayOptions = Parameters<typeof resource.create_atlas>[1];
declare const arrayOptions: CreateAtlasArrayOptions;

const _firstGeometryWidth: number | undefined = arrayOptions.geometries?.[0]?.width;
void _firstGeometryWidth;
