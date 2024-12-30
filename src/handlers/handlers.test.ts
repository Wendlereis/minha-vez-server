import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { Server, Socket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";

import {
  setupTestServer,
  waitForEventToBeEmitted,
} from "../../tests/utils/server.js";

vi.mock("../libraries/date.js", () => {
  return {
    now: vi.fn(),
    addMinutes: vi.fn().mockReturnValue({
      toJSDate: vi.fn().mockReturnValue("2023-07-14T00:00:00.000Z"),
    }),
  };
});

describe("Handlers", () => {
  let io: Server;

  let serverSocket: Socket | undefined;
  let clientSocket: ClientSocket;

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
      clientSocket.emit("lobby:join", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(queue).toEqual({
        atheletes: [{ id: serverSocket?.id, name: "expensive player" }],
        court: [],
        nextGameDate: "2023-07-14T00:00:00.000Z",
      });
    });

    it("should leave the lobby", async () => {
      clientSocket.emit("lobby:leave", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(queue).toEqual({
        atheletes: [],
        court: [],
        nextGameDate: "2023-07-14T00:00:00.000Z",
      });
    });
  });

  describe("Court Handler", () => {
    it("should join the court", async () => {
      clientSocket.emit("court:join", { name: "expensive player" });

      const court = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(court).toEqual({
        atheletes: [],
        court: [{ id: serverSocket?.id, name: "expensive player" }],
        nextGameDate: "2023-07-14T00:00:00.000Z",
      });
    });

    it("should leave the court", async () => {
      clientSocket.emit("court:leave", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(queue).toEqual({
        atheletes: [{ id: serverSocket?.id, name: "expensive player" }],
        court: [],
        nextGameDate: "2023-07-14T00:00:00.000Z",
      });
    });
  });
});
