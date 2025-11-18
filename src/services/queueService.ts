import { Athlete } from "../models/athleteModel.js";

import { athleteRepository } from "../repositories/athleteRepository.js";

function join(athlete: Athlete) {
  athleteRepository.add(athlete);
}

function leave(id: string) {
  athleteRepository.remove(id);
}

/**
 * Returns the first four athletes in the queue.
 * Optimized to use slice() instead of destructuring + manual array creation.
 */
function getFirstFour() {
  const queue = athleteRepository.list();

  return queue.slice(0, 4);
}

export const queueService = {
  join,
  leave,
  getFirstFour,
};
