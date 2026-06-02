import * as ts from "typescript";
import {
  createAssignmentStatement,
  createBlock,
  createExpressionStatement,
  createFunctionExpression,
  createIdentifier,
  type Identifier,
  NodeFlags,
  type Plugin,
  type Statement,
  type TransformationContext,
} from "typescript-to-lua";

const FACTORY_MODULE = "@defold-typescript/types";
const FACTORY_NAMES = new Set(["defineScript", "defineGuiScript", "defineRenderScript"]);

function resolvesToFactoryExport(callee: ts.Expression, checker: ts.TypeChecker): boolean {
  let symbol = checker.getSymbolAtLocation(callee);
  if (symbol === undefined) {
    return false;
  }
  if (symbol.flags & ts.SymbolFlags.Alias) {
    symbol = checker.getAliasedSymbol(symbol);
  }
  if (!FACTORY_NAMES.has(symbol.getName())) {
    return false;
  }
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (declaration === undefined) {
    return false;
  }
  return declaration.getSourceFile().fileName.includes(FACTORY_MODULE);
}

function isThisParameter(param: ts.ParameterDeclaration): boolean {
  return (
    ts.isIdentifier(param.name) &&
    ts.identifierToKeywordKind(param.name) === ts.SyntaxKind.ThisKeyword
  );
}

function hookName(property: ts.ObjectLiteralElementLike): string | undefined {
  const name = property.name;
  if (name === undefined) {
    return undefined;
  }
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text;
  }
  return undefined;
}

type HookFunction = (ts.MethodDeclaration | ts.FunctionExpression | ts.ArrowFunction) & {
  body: ts.ConciseBody;
};

function hookFunction(property: ts.ObjectLiteralElementLike): HookFunction | undefined {
  if (ts.isMethodDeclaration(property) && property.body !== undefined) {
    return property as HookFunction;
  }
  if (ts.isPropertyAssignment(property)) {
    const initializer = property.initializer;
    if (ts.isFunctionExpression(initializer) || ts.isArrowFunction(initializer)) {
      return initializer as HookFunction;
    }
  }
  return undefined;
}

function transformHookBody(fn: HookFunction, context: TransformationContext): Statement[] {
  if (ts.isBlock(fn.body)) {
    return context.transformStatements(fn.body.statements);
  }
  return [createExpressionStatement(context.transformExpression(fn.body))];
}

function eraseFactoryCall(
  expression: ts.Expression,
  context: TransformationContext,
): Statement[] | undefined {
  if (!ts.isCallExpression(expression)) {
    return undefined;
  }
  if (!resolvesToFactoryExport(expression.expression, context.checker)) {
    return undefined;
  }
  const hooks = expression.arguments[0];
  if (hooks === undefined || !ts.isObjectLiteralExpression(hooks)) {
    return undefined;
  }
  const statements: Statement[] = [];
  for (const property of hooks.properties) {
    const name = hookName(property);
    const fn = hookFunction(property);
    if (name === undefined || fn === undefined) {
      continue;
    }
    const params: Identifier[] = fn.parameters
      .filter((param) => !isThisParameter(param) && ts.isIdentifier(param.name))
      .map((param) => createIdentifier((param.name as ts.Identifier).text, param));
    const fnExpression = createFunctionExpression(
      createBlock(transformHookBody(fn, context)),
      params,
      undefined,
      NodeFlags.Declaration,
      fn,
    );
    statements.push(createAssignmentStatement(createIdentifier(name), fnExpression, property));
  }
  return statements;
}

function isFactoryOnlyImport(node: ts.ImportDeclaration): boolean {
  if (!ts.isStringLiteral(node.moduleSpecifier) || node.moduleSpecifier.text !== FACTORY_MODULE) {
    return false;
  }
  const clause = node.importClause;
  if (clause === undefined || clause.name !== undefined) {
    return false;
  }
  const bindings = clause.namedBindings;
  if (bindings === undefined || !ts.isNamedImports(bindings)) {
    return false;
  }
  return bindings.elements.every((element) =>
    FACTORY_NAMES.has((element.propertyName ?? element.name).text),
  );
}

export const lifecycleErasurePlugin: Plugin = {
  visitors: {
    [ts.SyntaxKind.ExpressionStatement]: (node, context) =>
      eraseFactoryCall(node.expression, context) ?? context.superTransformStatements(node),
    [ts.SyntaxKind.ExportAssignment]: (node, context) => {
      if (!node.isExportEquals) {
        const erased = eraseFactoryCall(node.expression, context);
        if (erased !== undefined) {
          return erased;
        }
      }
      return context.superTransformStatements(node);
    },
    [ts.SyntaxKind.ImportDeclaration]: (node, context) =>
      isFactoryOnlyImport(node) ? [] : context.superTransformStatements(node),
  },
};
