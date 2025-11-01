import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
  MockedFunction,
} from "vitest";

import { Server, Socket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";

import { Athlete } from "../models/athleteModel.js";

import {
  setupTestServer,
  waitForEventToBeEmitted,
} from "../../tests/utils/server.js";

import { lobbyService } from "../services/lobbyService.js";

const nextGameServiceHasGameAvailableMock = vi.fn();

const queueServiceGetFirstFourMock = vi.fn();

const courtServiceJoinMock = vi.fn();
const courtServiceLeaveMock = vi.fn();

const getInfoMocked = lobbyService.getInfo as MockedFunction<
  typeof lobbyService.getInfo
>;

vi.mock("../libraries/date.js", () => {
  return {
    now: vi.fn(),
    addMinutes: vi.fn().mockReturnValue({
      toJSDate: vi.fn().mockReturnValue("2023-07-14T00:00:00.000Z"),
    }),
  };
});

vi.mock("../services/queueService.js", () => {
  return {
    queueService: {
      join: vi.fn(),
      leave: vi.fn(),
      getFirstFour: () => queueServiceGetFirstFourMock(),
    },
  };
});

vi.mock("../services/lobbyService.js", () => {
  return {
    lobbyService: {
      getInfo: vi.fn(),
    },
  };
});

vi.mock("../services/nextGameService.js", () => {
  return {
    nextGameService: {
      hasGameAvailable: () => nextGameServiceHasGameAvailableMock(),
    },
  };
});

vi.mock("../services/courtService.js", () => {
  return {
    courtService: {
      join: (player: Athlete) => courtServiceJoinMock(player),
      leave: (id: string) => courtServiceLeaveMock(id),
    },
  };
});

describe("Handlers", () => {
  let io: Server;

  let clientSocket: ClientSocket;

  let serverSocket: Socket | undefined;

  beforeAll(async () => {
    const response = await setupTestServer(4444);

    io = response.io;

    clientSocket = response.clientSocket;

    serverSocket = response.serverSocket;
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  describe("Lobby Handler", () => {
    it("should join the lobby", async () => {
      getInfoMocked.mockReturnValue({
        athletes: [
          { id: "athlete-id", name: "expensive player", gender: "male" },
        ],
        court: [],
        nextGameDate: new Date("2023-07-14T00:00:00.000Z"),
      });

      clientSocket.emit("lobby:join", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(queue).toEqual({
        athletes: [
          { id: "athlete-id", name: "expensive player", gender: "male" },
        ],
        court: [],
        nextGameDate: "2023-07-14T00:00:00.000Z",
      });
    });

    it("should leave the lobby", async () => {
      getInfoMocked.mockReturnValue({
        athletes: [],
        court: [],
        nextGameDate: new Date("2023-07-14T00:00:00.000Z"),
      });

      clientSocket.emit("lobby:leave", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(queue).toEqual({
        athletes: [],
        court: [],
        nextGameDate: "2023-07-14T00:00:00.000Z",
      });
    });

    it("should emit the next-game event when join the lobby", async () => {
      nextGameServiceHasGameAvailableMock.mockReturnValue(true);

      getInfoMocked.mockReturnValue({
        athletes: [
          { id: "1", name: "first", gender: "female" },
          { id: "2", name: "second", gender: "female" },
          { id: "3", name: "third", gender: "female" },
          { id: "4", name: "fourth", gender: "female" },
          { id: "5", name: "expensive player", gender: "female" },
        ],
        court: [],
        nextGameDate: new Date("2023-07-14T00:00:00.000Z"),
      });

      queueServiceGetFirstFourMock.mockReturnValue([
        { id: "1", name: "first", gender: "female" },
        { id: "2", name: "second", gender: "female" },
        { id: "3", name: "third", gender: "female" },
        { id: "4", name: "fourth", gender: "female" },
      ]);

      clientSocket.emit("lobby:join", { name: "expensive player" });

      const nextGame = await waitForEventToBeEmitted(
        clientSocket,
        "court:next-game"
      );

      expect(nextGame).toEqual([
        { id: "1", name: "first", gender: "female" },
        { id: "2", name: "second", gender: "female" },
        { id: "3", name: "third", gender: "female" },
        { id: "4", name: "fourth", gender: "female" },
      ]);
    });
  });

  describe("Court Handler", () => {
    it("should join the court", async () => {
      getInfoMocked.mockReturnValue({
        athletes: [],
        court: [{ id: "athlete-id", name: "expensive player", gender: "male" }],
        nextGameDate: new Date("2023-07-14T00:00:00.000Z"),
      });

      clientSocket.emit("court:join", { name: "expensive player" });

      const court = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(courtServiceJoinMock).toHaveBeenCalledWith({
        id: serverSocket?.id,
        name: "expensive player",
      });

      expect(court).toEqual({
        athletes: [],
        court: [{ id: "athlete-id", name: "expensive player", gender: "male" }],
        nextGameDate: "2023-07-14T00:00:00.000Z",
      });
    });

    it("should leave the court", async () => {
      getInfoMocked.mockReturnValue({
        athletes: [
          { id: "athlete-id", name: "expensive player", gender: "female" },
        ],
        court: [],
        nextGameDate: new Date("2023-07-14T00:00:00.000Z"),
      });

      clientSocket.emit("court:leave", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(courtServiceLeaveMock).toHaveBeenCalledWith(serverSocket?.id);

      expect(queue).toEqual({
        athletes: [
          { id: "athlete-id", name: "expensive player", gender: "female" },
        ],
        court: [],
        nextGameDate: "2023-07-14T00:00:00.000Z",
      });
    });
  });
});
