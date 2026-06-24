import { Server, Socket } from "socket.io";

import { courtService } from "../services/courtService.js";
import { queueService } from "../services/queueService.js";
import { lobbyService } from "../services/lobbyService.js";
import { nextGameService } from "../services/nextGameService.js";
import { matchSetupService } from "../services/matchSetupService.js";
import { courtRepository } from "../repositories/courtRepository.js";

import { lobby, server } from "./events.js";

export function registerConnectionHandlers(io: Server, socket: Socket) {
  function disconnect() {
    // If they are in a pending game, decline it
    matchSetupService.declineInvite(io, socket.id);

    const wasOnCourt = courtRepository.list().some(p => p.id === socket.id);
    
    courtService.leave(socket.id);
    queueService.leave(socket.id);

    const lobbyList = lobbyService.getInfo();
    io.emit(lobby.list, lobbyList);

    if (wasOnCourt) {
      nextGameService.checkAndEmitNextGame(io);
    }
  }

  socket.on(server.disconnect, disconnect);
}
