import { describe, test, expect } from "vitest";

import { courtService } from "./courtService.js";

describe("Court Service", () => {
  test("should add an athlete in court list", () => {
    const result = courtService.join({ id: "999", name: "expensive player" });

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should remove an athlete from the court list", () => {
    const result = courtService.leave("999");

    expect(result).toEqual([]);
  });
});
