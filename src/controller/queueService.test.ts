import { describe, test, expect } from "vitest";

import { join, leave } from "./queueController.js";

describe("Queue Service", () => {
  test("should add an athlete in queue list", () => {
    const result = join({ id: "999", name: "expensive player" });

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should remove an athlete from the queue list", () => {
    const result = leave("999");

    expect(result).toEqual([]);
  });
});
