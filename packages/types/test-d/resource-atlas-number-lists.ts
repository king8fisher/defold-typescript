/// <reference path="../index.d.ts" />

declare const numberListPath: string;

resource.create_atlas(numberListPath, {
  vertices: [0, 0, 1, 1],
  uvs: [0, 0],
  indices: [0, 1, 2],
});

// @ts-expect-error vertices is number[]; a string element is rejected
resource.create_atlas(numberListPath, { vertices: ["x"] });
