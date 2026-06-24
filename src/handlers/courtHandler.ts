import { Server, Socket } from "socket.io";

import { Athlete, Gender } from "../models/athleteModel.js";

import { courtService } from "../services/courtService.js";
import { queueService } from "../services/queueService.js";
import { lobbyService } from "../services/lobbyService.js";
import { nextGameService } from "../services/nextGameService.js";
import { matchSetupService } from "../services/matchSetupService.js";

import { court, lobby } from "./events.js";

interface CourtPayload {
  name: string;
  gender: Gender;
}

interface LeavePayload extends CourtPayload {
  rejoinQueue?: boolean;
}

export function registerCourtHandlers(io: Server, socket: Socket) {
  function join(data: CourtPayload) {
    matchSetupService.acceptInvite(io, socket.id);
  }

  function skip(data: CourtPayload) {
    matchSetupService.declineInvite(io, socket.id);
  }

  function leave(data: LeavePayload) {
    const player: Athlete = {
      id: socket.id,
      name: data.name,
      gender: data.gender,
    };

    courtService.leave(player.id);

    if (data.rejoinQueue) {
      queueService.join(player);
    }

    const lobbyInfo = lobbyService.getInfo();

    io.emit(lobby.list, lobbyInfo);

    nextGameService.checkAndEmitNextGame(io);
  }

  socket.on(court.join, join);
  socket.on(court.leave, leave);
  socket.on(court.skip, skip);
}
