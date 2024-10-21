import { describe, test, expect } from "vitest";

import { queueService } from "./queueService.js";

describe("Queue Service", () => {
  test("should add an athlete in queue list", () => {
    const result = queueService.join({ id: "999", name: "expensive player" });

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should remove an athlete from the queue list", () => {
    const result = queueService.leave("999");

    expect(result).toEqual([]);
  });
});
