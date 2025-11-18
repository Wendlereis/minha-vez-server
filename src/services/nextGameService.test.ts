import { describe, expect, test, vi } from "vitest";

import { nextGameService } from "./nextGameService";

const athleteSizeMock = vi.fn();

const courtSizeMock = vi.fn();

vi.mock("../repositories/athleteRepository.js", () => {
  return {
    athleteRepository: {
      size: () => athleteSizeMock(),
    },
  };
});

vi.mock("../repositories/courtRepository.js", () => {
  return {
    courtRepository: {
      size: () => courtSizeMock(),
    },
  };
});

describe("Next Game Service", () => {
  test("should return true for next game available", () => {
    courtSizeMock.mockReturnValue(0);

    athleteSizeMock.mockReturnValue(5);

    const response = nextGameService.hasGameAvailable();

    expect(response).toBeTruthy();
  });

  test("should return false for next game available", () => {
    courtSizeMock.mockReturnValue(4);

    athleteSizeMock.mockReturnValue(2);

    const response = nextGameService.hasGameAvailable();

    expect(response).toBeFalsy();
  });
});
