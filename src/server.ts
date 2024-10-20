import { Server } from "socket.io";
import { createServer } from "http";

import { registerQueueHandlers } from "./handlers/queueHandler.js";
import { registerCourtHandlers } from "./handlers/courtHandler.js";
import { registerConnectionHandlers } from "./handlers/connectionHandler.js";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  registerQueueHandlers(io, socket);
  registerCourtHandlers(io, socket);
  registerConnectionHandlers(io, socket);
});

io.listen(3000);
