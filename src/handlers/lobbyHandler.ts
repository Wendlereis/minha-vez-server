import { Server, Socket } from "socket.io";

import { Athlete, Gender } from "../models/athleteModel.js";

import { queueService } from "../services/queueService.js";
import { lobbyService } from "../services/lobbyService.js";
import { nextGameService } from "../services/nextGameService.js";

import { court, lobby } from "./events.js";

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

    if (nextGameService.hasGameAvailable()) {
      const nextGamePlayers = queueService.getFirstFour();

      io.emit(court.nextGame, nextGamePlayers);
    }
  }

  function leave() {
    queueService.leave(socket.id);

    const lobbyList = lobbyService.getInfo();

    io.emit(lobby.list, lobbyList);
  }

  socket.on(lobby.join, join);
  socket.on(lobby.leave, leave);
}
