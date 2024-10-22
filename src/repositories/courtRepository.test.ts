import { describe, test, expect } from "vitest";

import { courtRepository } from "./courtRepository.js";

describe("Court Repository", () => {
  test("should add an athlete", () => {
    courtRepository.add({ id: "999", name: "expensive player" });

    const result = courtRepository.list();

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should list athletes", () => {
    const result = courtRepository.list();

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should not remove an unknown athlete from the list", () => {
    courtRepository.remove("000");

    const result = courtRepository.list();

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should remove an athlete from the list", () => {
    courtRepository.remove("999");

    const result = courtRepository.list();

    expect(result).toEqual([]);
  });
});
