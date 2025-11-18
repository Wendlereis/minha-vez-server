import { athleteRepository } from "../repositories/athleteRepository.js";
import { courtRepository } from "../repositories/courtRepository.js";

/**
 * Checks if a game can be started.
 * Optimized to use size() instead of list() to avoid creating unnecessary arrays.
 * Previous implementation called list() which creates an array just to check the length.
 */
function hasGameAvailable() {
  const hasCourtAvailable = courtRepository.size() === 0;

  const hasEnoughPlayers = athleteRepository.size() >= 4;

  return hasCourtAvailable && hasEnoughPlayers;
}

export const nextGameService = {
  hasGameAvailable,
};
