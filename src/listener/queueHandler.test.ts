import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Server, Socket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";

import {
  setupTestServer,
  waitForEventToBeEmitted,
} from "../../tests/utils/server.js";

describe("Queue Handler", () => {
  let io: Server;

  let serverSocket: Socket | undefined;
  let clientSocket: ClientSocket;

  beforeAll(async () => {
    const response = await setupTestServer(6002);

    io = response.io;

    clientSocket = response.clientSocket;

    serverSocket = response.serverSocket;
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  it("should join the queue", async () => {
    clientSocket.emit("queue:join", { name: "expensive player" });

    const queue = await waitForEventToBeEmitted(clientSocket, "queue:list");

    expect(queue).toEqual([{ id: serverSocket?.id, name: "expensive player" }]);
  });

  it("should leave the queue", async () => {
    clientSocket.emit("queue:leave", { name: "expensive player" });

    const queue = await waitForEventToBeEmitted(clientSocket, "queue:list");

    expect(queue).toEqual([]);
  });
});
