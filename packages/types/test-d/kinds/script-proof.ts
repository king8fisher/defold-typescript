export {};

vmath.vector3(1, 2, 3);

// @ts-expect-error gui.* is absent on the script surface
gui.get_width();

// @ts-expect-error render.* is absent on the script surface
render.get_width();
