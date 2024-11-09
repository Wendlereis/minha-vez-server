import { describe, test, expect, vi } from "vitest";

import { lobbyService } from "./lobbyService";

vi.mock("../repositories/athleteRepository.js", () => {
  return {
    athleteRepository: {
      size: vi.fn().mockReturnValue(10),
    },
  };
});

vi.mock("../libraries/date.js", () => {
  return {
    now: vi.fn(),
    addMinutes: vi.fn().mockReturnValue({
      toJSDate: vi.fn().mockReturnValue("2023-07-14T00:00:00.000Z"),
    }),
  };
});

describe("Lobby Service", () => {
  test("should return a lobby preview", () => {
    const preview = lobbyService.getPreview();

    expect(preview).toEqual({
      queueSize: 10,
      nextGameDate: "2023-07-14T00:00:00.000Z",
    });
  });
});
