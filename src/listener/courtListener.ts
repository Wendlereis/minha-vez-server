import { Server, Socket } from "socket.io";

import { Athlete } from "../model/athleteModel.js";
import * as courtController from "../controller/courtController.js";
import * as queueController from "../controller/queueController.js";

interface CourtPayload {
  name: string;
}

export function registerCourtListeners(io: Server, socket: Socket) {
  function join(data: CourtPayload) {
    const player: Athlete = {
      id: socket.id,
      name: data.name,
    };

    const courtPlayers = courtController.join(player);

    io.emit("court:list", courtPlayers);

    const athletes = queueController.leave(player.id);

    io.emit("queue:list", athletes);
  }

  function leave(data: CourtPayload) {
    const player: Athlete = {
      id: socket.id,
      name: data.name,
    };

    const courtPlayers = courtController.leave(player.id);

    io.emit("court:list", courtPlayers);

    const athletes = queueController.join(player);

    io.emit("queue:list", athletes);
  }

  socket.on("court:join", join);
  socket.on("court:leave", leave);
}
