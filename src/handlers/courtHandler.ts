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
    const { cleared, toRejoin } = courtService.requestLeave(socket.id, !!data.rejoinQueue);

    if (cleared) {
      toRejoin.forEach((p) => queueService.join(p));
      nextGameService.checkAndEmitNextGame(io);
    }

    io.emit(lobby.list, lobbyService.getInfo());
  }

  socket.on(court.join, join);
  socket.on(court.leave, leave);
  socket.on(court.skip, skip);
}
