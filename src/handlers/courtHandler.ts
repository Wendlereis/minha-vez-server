import { Server, Socket } from "socket.io";

import { Athlete } from "../models/athleteModel.js";

import { courtService } from "../services/courtService.js";
import { queueService } from "../services/queueService.js";
import { lobbyService } from "../services/lobbyService.js";

import { court, lobby } from "./events.js";

interface CourtPayload {
  name: string;
}

export function registerCourtHandlers(io: Server, socket: Socket) {
  function join(data: CourtPayload) {
    const player: Athlete = {
      id: socket.id,
      name: data.name,
    };

    queueService.leave(player.id);

    const lobbyInfo = lobbyService.getInfo();

    io.emit(lobby.list, lobbyInfo);
  }

  function leave(data: CourtPayload) {
    const player: Athlete = {
      id: socket.id,
      name: data.name,
    };

    courtService.leave(player.id);

    queueService.join(player);

    const lobbyInfo = lobbyService.getInfo();

    io.emit(lobby.list, lobbyInfo);
  }

  socket.on(court.join, join);
  socket.on(court.leave, leave);
}
