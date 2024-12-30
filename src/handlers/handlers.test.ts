import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Server, Socket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";

import {
  setupTestServer,
  waitForEventToBeEmitted,
} from "../../tests/utils/server.js";

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
      });
    });

    it("should leave the lobby", async () => {
      clientSocket.emit("lobby:leave", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(queue).toEqual({
        atheletes: [],
        court: [],
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
      });
    });

    it("should leave the court", async () => {
      clientSocket.emit("court:leave", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(queue).toEqual({
        atheletes: [{ id: serverSocket?.id, name: "expensive player" }],
        court: [],
      });
    });
  });
});
