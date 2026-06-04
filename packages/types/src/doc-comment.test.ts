import { describe, expect, test } from "bun:test";
import { htmlToDocText, renderDocComment } from "./doc-comment";

describe("htmlToDocText", () => {
  test("returns plain text unchanged", () => {
    expect(htmlToDocText("plain text")).toBe("plain text");
  });

  test("<code> becomes Markdown inline code", () => {
    expect(htmlToDocText("call <code>x</code> now")).toBe("call `x` now");
  });

  test("<em> becomes Markdown emphasis", () => {
    expect(htmlToDocText("an <em>x</em> value")).toBe("an *x* value");
  });

  test("<a href> becomes its plain link text", () => {
    expect(htmlToDocText('see <a href="/ref/go#go.foo">go.foo</a>')).toBe("see go.foo");
  });

  test("<ul><li> becomes a Markdown bullet list", () => {
    expect(htmlToDocText("<ul><li>a</li><li>b</li></ul>")).toBe("- a\n- b");
  });

  test("<br> becomes a newline", () => {
    expect(htmlToDocText("line one<br>line two")).toBe("line one\nline two");
  });

  test("consecutive whitespace collapses and ends trim", () => {
    expect(htmlToDocText("  foo   bar  ")).toBe("foo bar");
  });

  test("HTML entities decode", () => {
    expect(htmlToDocText("&lt;a&gt; &amp; &#39;b&#39; &quot;c&quot;")).toBe("<a> & 'b' \"c\"");
  });

  test("a literal */ is escaped so it cannot close a JSDoc comment", () => {
    const out = htmlToDocText("ends with */ here");
    expect(out).not.toContain("*/");
    expect(out).toBe("ends with *\\/ here");
  });

  test("empty / whitespace-only input returns empty string", () => {
    expect(htmlToDocText("")).toBe("");
    expect(htmlToDocText("   \n\t ")).toBe("");
  });
});

describe("renderDocComment", () => {
  test("builds the JSDoc line array with summary, params, and returns", () => {
    expect(
      renderDocComment({
        summary: "Does a thing.",
        params: [{ name: "id", doc: "the identifier" }],
        returns: "the result",
      }),
    ).toEqual([
      "/**",
      " * Does a thing.",
      " *",
      " * @param id - the identifier",
      " * @returns the result",
      " */",
    ]);
  });

  test("summary only omits the tag separator block", () => {
    expect(renderDocComment({ summary: "Just a summary." })).toEqual([
      "/**",
      " * Just a summary.",
      " */",
    ]);
  });

  test("params/returns without a summary still render", () => {
    expect(
      renderDocComment({ summary: "", params: [{ name: "x", doc: "an x" }], returns: "y out" }),
    ).toEqual(["/**", " * @param x - an x", " * @returns y out", " */"]);
  });

  test("empty params and blank docs are skipped", () => {
    expect(
      renderDocComment({
        summary: "Sum.",
        params: [
          { name: "a", doc: "" },
          { name: "b", doc: "kept" },
        ],
      }),
    ).toEqual(["/**", " * Sum.", " *", " * @param b - kept", " */"]);
  });

  test("nothing to document returns an empty array", () => {
    expect(renderDocComment({ summary: "" })).toEqual([]);
    expect(renderDocComment({ summary: "   " })).toEqual([]);
  });

  test("multi-line summary emits one ` * ` per line", () => {
    expect(renderDocComment({ summary: "first\nsecond" })).toEqual([
      "/**",
      " * first",
      " * second",
      " */",
    ]);
  });
});
