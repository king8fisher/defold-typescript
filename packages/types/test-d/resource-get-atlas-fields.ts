/// <reference path="../index.d.ts" />
import type { Hash } from "../src/core-types";

declare const path: string;

const atlas = resource.get_atlas(path);

const _texture: string | Hash = atlas.texture;
void _texture;

const _firstAnim = atlas.animations[0];
if (_firstAnim) {
  const _animFps: number = _firstAnim.fps;
  void _animFps;
}

// @ts-expect-error not_a_key is not a recovered get_atlas field
const _missing = atlas.not_a_key;
void _missing;
