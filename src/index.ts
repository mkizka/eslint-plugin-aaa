import { arrangeActAssertRule } from "./rules/arrange-act-assert.js";

export const arrangeActAssertPlugin = {
  rules: {
    "arrange-act-assert": arrangeActAssertRule,
  },
};

export const arrangeActAssert = {
  plugins: {
    aaa: arrangeActAssertPlugin,
  },
  rules: {
    "aaa/arrange-act-assert": "error",
  },
};
