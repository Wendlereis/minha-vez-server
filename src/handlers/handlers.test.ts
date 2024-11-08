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

  describe("Queue Handler", () => {
    it("should join the queue", async () => {
      clientSocket.emit("lobby:join", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(queue).toEqual([
        { id: serverSocket?.id, name: "expensive player" },
      ]);
    });

    it("should leave the queue", async () => {
      clientSocket.emit("lobby:leave", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "lobby:list");

      expect(queue).toEqual([]);
    });
  });

  describe("Court Handler", () => {
    it("should join the court", async () => {
      clientSocket.emit("court:join", { name: "expensive player" });

      const court = await waitForEventToBeEmitted(clientSocket, "court:list");

      expect(court).toEqual([
        { id: serverSocket?.id, name: "expensive player" },
      ]);
    });

    it("should leave the court", async () => {
      clientSocket.emit("court:leave", { name: "expensive player" });

      const queue = await waitForEventToBeEmitted(clientSocket, "court:list");

      expect(queue).toEqual([]);
    });
  });
});
