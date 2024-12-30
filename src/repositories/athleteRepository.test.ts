import { describe, test, expect } from "vitest";

import { athleteRepository } from "./athleteRepository.js";

describe("Athlete Repository", () => {
  test("should add an athlete", () => {
    athleteRepository.add({ id: "999", name: "expensive player" });

    const result = athleteRepository.list();

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should list athletes", () => {
    const result = athleteRepository.list();

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should return the athletes' list size", () => {
    const result = athleteRepository.size();

    expect(result).toEqual(1);
  });

  test("should not remove an unknown athlete from the list", () => {
    athleteRepository.remove("000");

    const result = athleteRepository.list();

    expect(result).toEqual([{ id: "999", name: "expensive player" }]);
  });

  test("should remove an athlete from the list", () => {
    athleteRepository.remove("999");

    const result = athleteRepository.list();

    expect(result).toEqual([]);
  });
});
