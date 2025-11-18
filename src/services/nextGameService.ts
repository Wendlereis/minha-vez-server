import { athleteRepository } from "../repositories/athleteRepository.js";
import { courtRepository } from "../repositories/courtRepository.js";

function hasGameAvailable() {
  const hasCourtAvailable = courtRepository.size() === 0;

  const hasEnoughPlayers = athleteRepository.size() >= 4;

  return hasCourtAvailable && hasEnoughPlayers;
}

export const nextGameService = {
  hasGameAvailable,
};
