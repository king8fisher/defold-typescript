/// <reference path="../index.d.ts" />

http.request("http://example.com", "GET", () => {}, undefined, undefined, { timeout: 1 });

// @ts-expect-error not_an_option is not a recovered field of the request options table
http.request("http://example.com", "GET", () => {}, undefined, undefined, { not_an_option: 1 });
