export function offGridLines(content: string): { line: number; text: string }[] {
  const offending: { line: number; text: string }[] = [];
  const lines = content.split("\n");
  let inBlock = false;
  lines.forEach((raw, index) => {
    const trimmed = raw.trimStart();
    if (!inBlock) {
      if (trimmed.startsWith("/**")) {
        inBlock = !raw.includes("*/");
      }
      return;
    }
    if (trimmed.startsWith("*")) {
      if (raw.includes("*/")) inBlock = false;
      return;
    }
    offending.push({ line: index + 1, text: raw });
    if (raw.includes("*/")) inBlock = false;
  });
  return offending;
}
