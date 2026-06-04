const NAMED_ENTITIES: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeEntities(text: string): string {
  let out = text;
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    out = out.split(entity).join(char);
  }
  out = out.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  // `&amp;` last so an already-decoded `&` is never re-interpreted.
  return out.split("&amp;").join("&");
}

/**
 * Convert a ref-doc HTML fragment to clean Markdown/plain text suitable for a
 * JSDoc comment body. Pure and free of any `ApiModule` dependency so the emit
 * slices and any future surface can reuse it.
 */
export function htmlToDocText(html: string): string {
  let text = html
    .replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<(?:em|i)>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*")
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<li>/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?pre>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  text = decodeEntities(text);

  // Collapse horizontal whitespace runs, trim around newlines, drop blank
  // runs, then trim the whole string — preserving single newlines from lists
  // and `<br>`.
  text = text
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  // A literal `*/` would close the JSDoc comment early; escape it.
  return text.split("*/").join("*\\/");
}

export interface DocCommentParts {
  summary: string;
  params?: { name: string; doc: string }[];
  returns?: string;
  example?: string;
}

/**
 * Build the JSDoc line array (no indentation) for the given parts. Returns `[]`
 * when there is nothing to document so the caller can emit nothing.
 */
export function renderDocComment(parts: DocCommentParts): string[] {
  const summaryLines = parts.summary.trim() === "" ? [] : parts.summary.split("\n");
  const params = (parts.params ?? []).filter((p) => p.doc.trim() !== "");
  const returns = parts.returns?.trim() ? parts.returns : "";

  if (summaryLines.length === 0 && params.length === 0 && returns === "") {
    return [];
  }

  const lines = ["/**"];
  for (const line of summaryLines) {
    lines.push(` * ${line}`);
  }

  const hasTags = params.length > 0 || returns !== "";
  if (summaryLines.length > 0 && hasTags) {
    lines.push(" *");
  }

  for (const param of params) {
    lines.push(` * @param ${param.name} - ${param.doc}`);
  }
  if (returns !== "") {
    lines.push(` * @returns ${returns}`);
  }

  lines.push(" */");
  return lines;
}
