import { Server } from "socket.io";
import { createServer } from "http";

import { registerQueueListeners } from "./listener/queueListener.js";
import { registerCourtListeners } from "./listener/courtListener.js";
import { registerConnectionListeners } from "./listener/connectionListener.js";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  registerQueueListeners(io, socket);

  registerCourtListeners(io, socket);

  registerConnectionListeners(io, socket);
});

io.listen(3000);
