import * as ts from "typescript";
import type { Plugin } from "typescript-to-lua";
import { TIMERS_MODULE_SPECIFIER, TIMERS_REQUIRE_NAME } from "./timers-runtime";

function isTimersSpecifier(node: ts.Expression): node is ts.StringLiteral {
  return ts.isStringLiteral(node) && node.text === TIMERS_MODULE_SPECIFIER;
}

// True when a user source imports the polyfill module, so `collectOutputs` can
// surface the runtime pay-for-use. The original specifier is read here (the
// lowering rewrites a fresh node for emit, not the source AST).
export function importsTimersModule(sourceFile: ts.SourceFile): boolean {
  return sourceFile.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) && isTimersSpecifier(statement.moduleSpecifier),
  );
}

// Rewrite the dotted package specifier to the flat `require` name so TSTL emits
// `require("defold_typescript_timers")` instead of the unresolvable default.
// The `@NoResolution:` marker tells TSTL's resolver to leave the path alone (the
// runtime module has no source file in the program); the resolver strips the
// marker, leaving the bare flat require. The import clause is the original node,
// so the checker/resolver still bind the named imports.
const TIMERS_REQUIRE_PATH = `@NoResolution:${TIMERS_REQUIRE_NAME}`;

export const timersLoweringPlugin: Plugin = {
  visitors: {
    [ts.SyntaxKind.ImportDeclaration]: (node, context) => {
      if (!isTimersSpecifier(node.moduleSpecifier)) {
        return context.superTransformStatements(node);
      }
      const rewritten = ts.factory.updateImportDeclaration(
        node,
        node.modifiers,
        node.importClause,
        ts.factory.createStringLiteral(TIMERS_REQUIRE_PATH),
        node.attributes,
      );
      return context.superTransformStatements(rewritten);
    },
  },
};
