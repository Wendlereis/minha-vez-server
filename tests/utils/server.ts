import { createServer } from "http";

import { Server, Socket } from "socket.io";
import { Socket as ClientSocket, io as ioc } from "socket.io-client";

import { registerQueueHandlers } from "../../src/handlers/queueHandler.js";
import { registerCourtHandlers } from "../../src/handlers/courtHandler.js";
import { registerConnectionHandlers } from "../../src/handlers/connectionHandler.js";

export function waitForEventToBeEmitted(emitter: ClientSocket, event: string) {
  return new Promise((resolve) => {
    emitter.once(event, resolve);
  });
}

export async function setupTestServer(port: number) {
  const httpServer = createServer();

  const io = new Server(httpServer);

  httpServer.listen(port);

  const clientSocket = ioc(`ws://localhost:${port}`, {
    transports: ["websocket"],
  });

  let serverSocket: Socket | undefined = undefined;

  io.on("connection", (connectedSocket) => {
    serverSocket = connectedSocket;

    registerQueueHandlers(io, serverSocket);
    registerCourtHandlers(io, serverSocket);
    registerConnectionHandlers(io, serverSocket);
  });

  await waitForEventToBeEmitted(clientSocket, "connect");

  return { io, clientSocket, serverSocket };
}
