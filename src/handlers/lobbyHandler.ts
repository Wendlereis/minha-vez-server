import { Server, Socket } from "socket.io";

import { Athlete } from "../models/athleteModel.js";

import { queueService } from "../services/queueService.js";
import { lobbyService } from "../services/lobbyService.js";

import { lobby } from "./events.js";

interface QueuePayload {
  name: string;
}

export function registerLobbyHandlers(io: Server, socket: Socket) {
  function join(data: QueuePayload) {
    const athlete: Athlete = {
      id: socket.id,
      name: data.name,
    };

    queueService.join(athlete);

    const lobbyList = lobbyService.getList();
    
    io.emit(lobby.list, lobbyList);
  }
  
  function leave() {
    queueService.leave(socket.id);
    
    const lobbyList = lobbyService.getList();

    io.emit(lobby.list, lobbyList);
  }

  socket.on(lobby.join, join);
  socket.on(lobby.leave, leave);
}
