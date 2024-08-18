import type { Rule } from "eslint";
import type ESTree from "estree";

const isFunction = (
  node: ESTree.BaseNode,
): node is ESTree.FunctionExpression | ESTree.ArrowFunctionExpression => {
  return (
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  );
};

const getTestBody = (node: ESTree.Node) => {
  if (
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === "test" &&
    node.arguments[1] &&
    isFunction(node.arguments[1]) &&
    node.arguments[1].body.type === "BlockStatement"
  ) {
    return node.arguments[1].body;
  }
  return null;
};

const validateComments = (comments: ESTree.Comment[]) => {
  const validComments: ESTree.Comment[] = [];
  for (const comment of comments) {
    if (
      comment.value.toLowerCase().trim().startsWith("arrange") &&
      validComments.length === 0
    ) {
      validComments.push(comment);
    }
    if (
      comment.value.toLowerCase().trim().startsWith("act") &&
      validComments.length === 1
    ) {
      validComments.push(comment);
    }
    if (
      comment.value.toLowerCase().trim().startsWith("assert") &&
      validComments.length === 2
    ) {
      validComments.push(comment);
    }
  }
  return validComments;
};

export const arrangeActAssertRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce comments in the order of arrange, act, and assert",
    },
    schema: [],
    fixable: "code", // This rule can be fixed automatically
  },
  create(context) {
    return {
      CallExpression(node) {
        const testBody = getTestBody(node);
        if (!testBody) return;

        const validComments = validateComments(
          context.sourceCode.getCommentsInside(testBody),
        );
        if (validComments.length === 0) {
          context.report({
            node,
            message: "`arrange`, `act`, and `assert` comments are missing.",
          });
          return;
        }
        if (validComments.length === 1) {
          context.report({
            loc: validComments.at(-1)!.loc!,
            message: "`act` comment needs to appear after `arrange`.",
          });
          return;
        }
        if (validComments.length === 2) {
          context.report({
            loc: validComments.at(-1)!.loc!,
            message: "`assert` comment needs to appear after `act`.",
          });
          return;
        }
      },
    };
  },
};
