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
    return node.arguments[1].body.body;
  }
  return null;
};

export const arrangeActAssertRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce comments in the order of arrange, act, and assert",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const testBody = getTestBody(node);
        if (!testBody) return;

        const comments = testBody
          .map((node) => context.sourceCode.getCommentsBefore(node))
          .flat()
          .map((comment) => {
            const text = comment.value.trim();
            return {
              text,
              loc: comment.loc,
              valid: false,
            };
          });

        const found = {
          arrange: false,
          act: false,
          assert: false,
        };
        for (const comment of comments) {
          if (comment.text === "arrange") {
            comment.valid = !found.arrange && !found.act && !found.assert;
            found.arrange = true;
          } else if (comment.text === "act") {
            comment.valid = found.arrange && !found.act && !found.assert;
            found.act = true;
          } else if (comment.text === "assert") {
            comment.valid = found.arrange && found.act && !found.assert;
            found.assert = true;
          }
        }

        const lastValidCommentLoc = comments.findLast(
          (comment) => comment.valid,
        )?.loc;
        const reportOptions = lastValidCommentLoc
          ? { loc: lastValidCommentLoc }
          : { node };

        if (!found.arrange) {
          context.report({
            ...reportOptions,
            message:
              "`arrange` comment needs to appear at the beginning of the test.",
          });
          return;
        }
        if (!found.act) {
          context.report({
            ...reportOptions,
            message: "`act` comment needs to appear after `arrange`.",
          });
          return;
        }
        if (!found.assert) {
          context.report({
            ...reportOptions,
            message: "`assert` comment needs to appear after `act`.",
          });
          return;
        }
      },
    };
  },
};
