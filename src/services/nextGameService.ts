import { athleteRepository } from "../repositories/athleteRepository.js";
import { courtRepository } from "../repositories/courtRepository.js";

function hasGameAvailable() {
  const court = courtRepository.list();

  const queue = athleteRepository.list();

  const hasCourtAvailable = court.length === 0;

  const hasEnoughPlayers = queue.length >= 4;

  return hasCourtAvailable && hasEnoughPlayers;
}

export const nextGameService = {
  hasGameAvailable,
};
