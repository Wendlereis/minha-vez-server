import { describe, test, expect } from "vitest";

import { add, list, remove } from "./courtRepository.js";

describe("Court Repository", () => {
  test("should add an athlete", () => {
    add({ id: "999", name: "expensive player" });

    const result = list();

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should list athletes", () => {
    const result = list();

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should not remove an unknown athlete from the list", () => {
    remove("000");

    const result = list();

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should remove an athlete from the list", () => {
    remove("999");

    const result = list();

    expect(result).toEqual([]);
  });
});
