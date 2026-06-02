/// <reference path="../index.d.ts" />

sys.open_url("https://defold.com", { target: "_blank" });

// @ts-expect-error not_target is not a recovered field of the sys.open_url attributes table
sys.open_url("https://defold.com", { not_target: "_blank" });

// @ts-expect-error target is typed string, not number
sys.open_url("https://defold.com", { target: 1 });
