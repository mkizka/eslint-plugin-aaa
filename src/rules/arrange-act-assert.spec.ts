import { RuleTester } from "eslint";
import { describe, test } from "vitest";

import { arrangeActAssertRule } from "./arrange-act-assert.js";

export const expectCode = (code: string, error?: RuleTester.TestCaseError) => {
  const ruleTester = new RuleTester({
    languageOptions: { ecmaVersion: 2020 },
  });
  ruleTester.run(
    "arrange-act-assert",
    arrangeActAssertRule,
    error
      ? { valid: [], invalid: [{ code, errors: [error] }] }
      : { valid: [{ code }], invalid: [] },
  );
};

describe("arrangeActAssert", () => {
  test("Comments must be written in the order of arrange, act, and assert", () => {
    expectCode(`\
      test("my test 1", () => {
        // arrange
        const a = 1; // Non-relevant comments are OK
        // act
        const result = a + 1;
        // assert
        expect(result).toBe(2);
      });
      // Multiple tests are OK
      test("my test 2", () => {
        // arrange
        // Comments in order are OK
        const a = 1;
        // act
        const result = a + 1;
        // assert
        expect(result).toBe(2);
      });
    `);
  });
  test("Error if arrange is not at the start", () => {
    expectCode(
      `\
      // ↓ Error will occur here
      test("my test 1", () => {
        const a = 1;
        const result = a + 1;
        expect(result).toBe(2);
      });
    `,
      {
        message:
          "`arrange` comment needs to appear at the beginning of the test.",
        line: 2,
      },
    );
  });
  test("Error if act is not second", () => {
    expectCode(
      `\
      test("my test 1", () => {
        // ↓ Error will occur here
        // arrange
        const a = 1;
        const result = a + 1;
        // assert
        expect(result).toBe(2);
      });
    `,
      {
        message: "`act` comment needs to appear after `arrange`.",
        line: 3,
      },
    );
  });
  test("Error if assert is not last", () => {
    expectCode(
      `\
      test("my test 1", () => {
        // arrange
        const a = 1;
        // ↓ Error will occur here
        // act
        const result = a + 1;
        expect(result).toBe(2);
      });
    `,
      {
        message: "`assert` comment needs to appear after `act`.",
        line: 5,
      },
    );
  });
});
