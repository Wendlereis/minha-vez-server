import { Server, Socket } from "socket.io";

import { Athlete } from "../models/athleteModel.js";

import { queueService } from "../services/queueService.js";

interface QueuePayload {
  name: string;
}

export function registerLobbyHandlers(io: Server, socket: Socket) {
  function join(data: QueuePayload) {
    const athlete: Athlete = {
      id: socket.id,
      name: data.name,
    };

    const athletes = queueService.join(athlete);

    io.emit("lobby:list", athletes);
  }

  function leave() {
    const athletes = queueService.leave(socket.id);

    io.emit("lobby:list", athletes);
  }

  socket.on("lobby:join", join);
  socket.on("lobby:leave", leave);
}
