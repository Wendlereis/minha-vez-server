import { Server, Socket } from "socket.io";

import { Athlete } from "../model/athleteModel.js";
import * as queueController from "../controller/queueController.js";

interface QueuePayload {
  name: string;
}

export function registerQueueListeners(io: Server, socket: Socket) {
  function join(data: QueuePayload) {
    const athlete: Athlete = {
      id: socket.id,
      name: data.name,
    };

    const athletes = queueController.join(athlete);

    io.emit("players-waiting", athletes);
  }

  function leave() {
    const athletes = queueController.leave(socket.id);

    io.emit("players-waiting", athletes);
  }

  socket.on("queue:join", join);
  socket.on("queue:leave", leave);
}
