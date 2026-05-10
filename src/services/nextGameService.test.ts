import { describe, expect, test, vi } from "vitest";
import { Server } from "socket.io";

import { nextGameService } from "./nextGameService";

const athleteListMock = vi.fn();
const courtListMock = vi.fn();
const queueServiceGetFirstFourMock = vi.fn();

vi.mock("../repositories/athleteRepository.js", () => ({
  athleteRepository: { list: () => athleteListMock() },
}));

vi.mock("../repositories/courtRepository.js", () => ({
  courtRepository: { list: () => courtListMock() },
}));

vi.mock("./queueService.js", () => ({
  queueService: { getFirstFour: () => queueServiceGetFirstFourMock() },
}));

const FOUR_PLAYERS = [
  { id: "1", name: "first", gender: "female" },
  { id: "2", name: "second", gender: "female" },
  { id: "3", name: "third", gender: "female" },
  { id: "4", name: "fourth", gender: "female" },
];

describe("Next Game Service", () => {
  describe("checkAndEmitNextGame", () => {
    test("should emit court:next-game when court is empty and 4+ players in queue", () => {
      courtListMock.mockReturnValue([]);
      athleteListMock.mockReturnValue([
        ...FOUR_PLAYERS,
        { id: "5", name: "fifth", gender: "male" },
      ]);
      queueServiceGetFirstFourMock.mockReturnValue(FOUR_PLAYERS);

      const ioMock = { emit: vi.fn() } as unknown as Server;

      nextGameService.checkAndEmitNextGame(ioMock);

      expect(ioMock.emit).toHaveBeenCalledWith("court:next-game", FOUR_PLAYERS);
    });

    test("should not emit when court is occupied", () => {
      courtListMock.mockReturnValue(FOUR_PLAYERS);
      athleteListMock.mockReturnValue([{ id: "5", name: "fifth", gender: "male" }]);

      const ioMock = { emit: vi.fn() } as unknown as Server;

      nextGameService.checkAndEmitNextGame(ioMock);

      expect(ioMock.emit).not.toHaveBeenCalled();
    });

    test("should not emit when fewer than 4 players are in the queue", () => {
      courtListMock.mockReturnValue([]);
      athleteListMock.mockReturnValue([
        { id: "1", name: "first", gender: "female" },
        { id: "2", name: "second", gender: "female" },
      ]);

      const ioMock = { emit: vi.fn() } as unknown as Server;

      nextGameService.checkAndEmitNextGame(ioMock);

      expect(ioMock.emit).not.toHaveBeenCalled();
    });
  });
});
