/// <reference path="../index.d.ts" />

physics.set_shape("/collisionobject", "shape", {
  type: physics.SHAPE_TYPE_SPHERE,
  diameter: 10,
});

physics.set_shape("/collisionobject", "shape", {
  type: physics.SHAPE_TYPE_SPHERE,
  // @ts-expect-error diamter is a misspelling of the recovered diameter field
  diamter: 10,
});
