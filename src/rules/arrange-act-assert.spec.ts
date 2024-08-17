import { RuleTester } from "eslint";
import { describe, test } from "vitest";

import { arrangeActAssertRule } from "./arrange-act-assert.js";

export const runTest = (
  testCase: RuleTester.ValidTestCase | RuleTester.InvalidTestCase,
) => {
  const ruleTester = new RuleTester({
    languageOptions: { ecmaVersion: 2020 },
  });
  ruleTester.run(
    "arrange-act-assert",
    arrangeActAssertRule,
    "errors" in testCase
      ? { valid: [], invalid: [testCase] }
      : { valid: [testCase], invalid: [] },
  );
};

describe("arrangeActAssert", () => {
  test("Comments must be written in the order of arrange, act, and assert", () => {
    runTest({
      code: `\
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
      `,
    });
  });
  test("Comments are case-insensitive", () => {
    runTest({
      code: `\
        test("my test 1", () => {
          // Arrange
          const a = 1;
          // Act
          const result = a + 1;
          // Assert
          expect(result).toBe(2);
        });
      `,
    });
  });
  test("Do not report if argument is not a function", () => {
    runTest({ code: "test(null)" });
  });
  test("Error if body is empty", () => {
    runTest({
      code: "test('empty test', () => {})",
      errors: [
        {
          message: "`arrange`, `act`, and `assert` comments are missing.",
          line: 1,
        },
      ],
    });
  });
  test("Error if arrange is not at the start", () => {
    runTest({
      code: `\
        // ↓ Error will occur here
        test("my test 1", () => {
          const a = 1;
          const result = a + 1;
          expect(result).toBe(2);
        });
      `,
      errors: [
        {
          message: "`arrange`, `act`, and `assert` comments are missing.",
          line: 2,
        },
      ],
    });
  });
  test("Error if act is not second", () => {
    runTest({
      code: `\
        test("my test 1", () => {
          // ↓ Error will occur here
          // arrange
          const a = 1;
          const result = a + 1;
          // assert
          expect(result).toBe(2);
        });
      `,
      errors: [
        {
          message: "`act` comment needs to appear after `arrange`.",
          line: 3,
        },
      ],
    });
  });
  test("Error if assert is not last", () => {
    runTest({
      code: `\
        test("my test 1", () => {
          // arrange
          const a = 1;
          // ↓ Error will occur here
          // act
          const result = a + 1;
          expect(result).toBe(2);
        });
      `,
      errors: [
        {
          message: "`assert` comment needs to appear after `act`.",
          line: 5,
        },
      ],
    });
  });
  test("Error if order is wrong", () => {
    runTest({
      code: `\
        test("my test 1", () => {
          // act
          const a = 1;
          // assert
          const result = a + 1;
          // arrange
          expect(result).toBe(2);
        });
      `,
      errors: [
        {
          message: "`act` comment needs to appear after `arrange`.",
          line: 6,
        },
      ],
    });
  });
});
