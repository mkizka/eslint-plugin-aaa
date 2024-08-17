import { describe, expect, test } from "vitest";

describe("a", () => {
  test("b", () => {
    // something comment
    // arrange
    const a = 1;
    // something comment
    // act
    const result = a + 1;
    // something comment
    // assert
    expect(result).toBe(2);
  });
});
