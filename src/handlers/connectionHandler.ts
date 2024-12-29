import { Server, Socket } from "socket.io";

import { courtService } from "../services/courtService.js";
import { queueService } from "../services/queueService.js";
import { lobbyService } from "../services/lobbyService.js";

import { court, lobby, server } from "./events.js";

export function registerConnectionHandlers(io: Server, socket: Socket) {
  function disconnect() {
    const courtPlayers = courtService.leave(socket.id);

    io.emit(court.list, courtPlayers);

    queueService.leave(socket.id);

    const lobbyList = lobbyService.getList();

    io.emit(lobby.list, lobbyList);
  }

  socket.on(server.disconnect, disconnect);
}
