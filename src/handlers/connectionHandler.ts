import { Server, Socket } from "socket.io";

import { courtService } from "../services/courtService.js";
import { queueService } from "../services/queueService.js";

export function registerConnectionHandlers(io: Server, socket: Socket) {
  function disconnect() {
    const courtPlayers = courtService.leave(socket.id);

    io.emit("court:list", courtPlayers);

    const athletes = queueService.leave(socket.id);

    io.emit("queue:list", athletes);
  }

  socket.on("disconnect", disconnect);
}
