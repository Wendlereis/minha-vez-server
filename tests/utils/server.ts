import { createServer } from "http";

import { Server, Socket } from "socket.io";
import { Socket as ClientSocket, io as ioc } from "socket.io-client";

import { registerQueueListeners } from "../../src/listener/queueListener.js";
import { registerCourtListeners } from "../../src/listener/courtListener.js";
import { registerConnectionListeners } from "../../src/listener/connectionListener.js";

export function waitForEventToBeEmitted(emitter: ClientSocket, event: string) {
  return new Promise<any>((resolve) => {
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

    registerQueueListeners(io, serverSocket);
    registerCourtListeners(io, serverSocket);
    registerConnectionListeners(io, serverSocket);
  });

  await waitForEventToBeEmitted(clientSocket, "connect");

  return { io, clientSocket, serverSocket };
}
