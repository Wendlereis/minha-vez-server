import { describe, expect, test, vi } from "vitest";

import { nextGameService } from "./nextGameService";

const athleteListMock = vi.fn();

const courtListMock = vi.fn();

vi.mock("../repositories/athleteRepository.js", () => {
  return {
    athleteRepository: {
      list: () => athleteListMock(),
    },
  };
});

vi.mock("../repositories/courtRepository.js", () => {
  return {
    courtRepository: {
      list: () => courtListMock(),
    },
  };
});

describe("Next Game Service", () => {
  test("should return true for next game available", () => {
    courtListMock.mockReturnValue([]);

    athleteListMock.mockReturnValue([
      { name: "first" },
      { name: "second" },
      { name: "third" },
      { name: "fourth" },
      { name: "fifth" },
    ]);

    const response = nextGameService.hasGameAvailable();

    expect(response).toBeTruthy();
  });

  test("should return false for next game available", () => {
    courtListMock.mockReturnValue([
      { name: "first" },
      { name: "second" },
      { name: "third" },
      { name: "fourth" },
    ]);

    athleteListMock.mockReturnValue([{ name: "fifth" }, { name: "sixth" }]);

    const response = nextGameService.hasGameAvailable();

    expect(response).toBeFalsy();
  });
});
