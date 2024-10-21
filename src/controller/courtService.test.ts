import { describe, test, expect } from "vitest";

import { join, leave } from "./courtController.js";

describe("Court Service", () => {
  test("should add an athlete in court list", () => {
    const result = join({ id: "999", name: "expensive player" });

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should remove an athlete from the court list", () => {
    const result = leave("999");

    expect(result).toEqual([]);
  });
});
