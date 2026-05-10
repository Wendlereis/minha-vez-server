import { Server } from "socket.io";

import { athleteRepository } from "../repositories/athleteRepository.js";
import { courtRepository } from "../repositories/courtRepository.js";
import { queueService } from "./queueService.js";
import { court } from "../handlers/events.js";

function hasGameAvailable() {
  const courtPlayers = courtRepository.list();
  const queue = athleteRepository.list();

  const hasCourtAvailable = courtPlayers.length === 0;
  const hasEnoughPlayers = queue.length >= 4;

  return hasCourtAvailable && hasEnoughPlayers;
}

function checkAndEmitNextGame(io: Server) {
  if (hasGameAvailable()) {
    const nextGamePlayers = queueService.getFirstFour();
    io.emit(court.nextGame, nextGamePlayers);
  }
}

export const nextGameService = {
  hasGameAvailable,
  checkAndEmitNextGame,
};
