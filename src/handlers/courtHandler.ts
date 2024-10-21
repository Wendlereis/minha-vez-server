import { Server, Socket } from "socket.io";

import { Athlete } from "../models/athleteModel.js";

import { courtService } from "../services/courtService.js";
import { queueService } from "../services/queueService.js";

interface CourtPayload {
  name: string;
}

export function registerCourtHandlers(io: Server, socket: Socket) {
  function join(data: CourtPayload) {
    const player: Athlete = {
      id: socket.id,
      name: data.name,
    };

    const courtPlayers = courtService.join(player);

    io.emit("court:list", courtPlayers);

    const athletes = queueService.leave(player.id);

    io.emit("queue:list", athletes);
  }

  function leave(data: CourtPayload) {
    const player: Athlete = {
      id: socket.id,
      name: data.name,
    };

    const courtPlayers = courtService.leave(player.id);

    io.emit("court:list", courtPlayers);

    const athletes = queueService.join(player);

    io.emit("queue:list", athletes);
  }

  socket.on("court:join", join);
  socket.on("court:leave", leave);
}
