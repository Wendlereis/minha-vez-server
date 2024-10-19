import { Server, Socket } from "socket.io";

import * as courtController from "../controller/courtController.js";
import * as queueController from "../controller/queueController.js";

export function registerConnectionListeners(io: Server, socket: Socket) {
  function disconnect() {
    const courtPlayers = courtController.leave(socket.id);

    io.emit("court:list", courtPlayers);

    const athletes = queueController.leave(socket.id);

    io.emit("queue:list", athletes);
  }

  socket.on("disconnect", disconnect);
}
