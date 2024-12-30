import { Server } from "socket.io";
import { createServer } from "http";

import { lobbyService } from "./services/lobbyService.js";

import { registerLobbyHandlers } from "./handlers/lobbyHandler.js";
import { registerCourtHandlers } from "./handlers/courtHandler.js";
import { registerConnectionHandlers } from "./handlers/connectionHandler.js";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  function preview() {
    const preview = lobbyService.getPreview();

    socket.emit("lobby:preview", preview);
  }

  preview();

  registerLobbyHandlers(io, socket);
  registerCourtHandlers(io, socket);
  registerConnectionHandlers(io, socket);
});

io.listen(3000);
