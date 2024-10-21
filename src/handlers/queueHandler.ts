import { Server, Socket } from "socket.io";

import { Athlete } from "../models/athleteModel.js";

import { queueService } from "../services/queueService.js";

interface QueuePayload {
  name: string;
}

export function registerQueueHandlers(io: Server, socket: Socket) {
  function join(data: QueuePayload) {
    const athlete: Athlete = {
      id: socket.id,
      name: data.name,
    };

    const athletes = queueService.join(athlete);

    io.emit("queue:list", athletes);
  }

  function leave() {
    const athletes = queueService.leave(socket.id);

    io.emit("queue:list", athletes);
  }

  socket.on("queue:join", join);
  socket.on("queue:leave", leave);
}
