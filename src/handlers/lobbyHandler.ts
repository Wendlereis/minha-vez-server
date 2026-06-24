import { Server, Socket } from "socket.io";

import { Athlete, Gender } from "../models/athleteModel.js";

import { queueService } from "../services/queueService.js";
import { lobbyService } from "../services/lobbyService.js";
import { nextGameService } from "../services/nextGameService.js";
import { matchSetupService } from "../services/matchSetupService.js";

import { lobby } from "./events.js";

interface QueuePayload {
  name: string;
  gender: Gender;
}

export function registerLobbyHandlers(io: Server, socket: Socket) {
  function join(data: QueuePayload) {
    const athlete: Athlete = {
      id: socket.id,
      name: data.name,
      gender: data.gender,
    };

    queueService.join(athlete);

    const lobbyList = lobbyService.getInfo();

    io.emit(lobby.list, lobbyList);

    nextGameService.checkAndEmitNextGame(io);
    
    // Also check if there's a pending game that needs filling
    matchSetupService.handleNewPlayerInQueue(io);
  }

  function leave() {
    queueService.leave(socket.id);

    const lobbyList = lobbyService.getInfo();

    io.emit(lobby.list, lobbyList);
  }

  socket.on(lobby.join, join);
  socket.on(lobby.leave, leave);
}
