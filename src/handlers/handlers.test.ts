import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { Server, Socket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";

import { lobbyService } from "../services/lobbyService.js";
import { queueService } from "../services/queueService.js";
import { courtService } from "../services/courtService.js";
import { nextGameService } from "../services/nextGameService.js";

import {
  setupTestServer,
  waitForEventToBeEmitted,
} from "../../tests/utils/server.js";

vi.mock("../services/lobbyService.js");

vi.mock("../services/queueService.js");

vi.mock("../services/courtService.js");

vi.mock("../services/nextGameService.js");

const lobbyServiceGetInfoMock = vi.mocked(lobbyService.getInfo);

const courtServiceJoinMock = vi.mocked(courtService.join);
const courtServiceLeaveMock = vi.mocked(courtService.leave);

const nextGameServiceCheckAndEmitNextGameMock = vi.mocked(
  nextGameService.checkAndEmitNextGame
);

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
      lobbyServiceGetInfoMock.mockReturnValue({
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
      lobbyServiceGetInfoMock.mockReturnValue({
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
      lobbyServiceGetInfoMock.mockReturnValue({
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

      nextGameServiceCheckAndEmitNextGameMock.mockImplementation((io) => {
        io.emit("court:next-game", [
          { id: "1", name: "first", gender: "female" },
          { id: "2", name: "second", gender: "female" },
          { id: "3", name: "third", gender: "female" },
          { id: "4", name: "fourth", gender: "female" },
        ]);
      });

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
      lobbyServiceGetInfoMock.mockReturnValue({
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
      lobbyServiceGetInfoMock.mockReturnValue({
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

    it("should emit the next-game event when leaving court with enough players in queue", async () => {
      lobbyServiceGetInfoMock.mockReturnValue({
        athletes: [
          { id: "1", name: "first", gender: "female" },
          { id: "2", name: "second", gender: "female" },
          { id: "3", name: "third", gender: "female" },
          { id: "4", name: "fourth", gender: "female" },
        ],
        court: [],
        nextGameDate: new Date("2023-07-14T00:00:00.000Z"),
      });

      nextGameServiceCheckAndEmitNextGameMock.mockImplementation((io) => {
        io.emit("court:next-game", [
          { id: "1", name: "first", gender: "female" },
          { id: "2", name: "second", gender: "female" },
          { id: "3", name: "third", gender: "female" },
          { id: "4", name: "fourth", gender: "female" },
        ]);
      });

      clientSocket.emit("court:leave", { name: "expensive player", gender: "female" });

      const nextGame = await waitForEventToBeEmitted(clientSocket, "court:next-game");

      expect(nextGame).toEqual([
        { id: "1", name: "first", gender: "female" },
        { id: "2", name: "second", gender: "female" },
        { id: "3", name: "third", gender: "female" },
        { id: "4", name: "fourth", gender: "female" },
      ]);
    });
  });
});
