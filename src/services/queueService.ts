import { Athlete } from "../models/athleteModel.js";

import { athleteRepository } from "../repositories/athleteRepository.js";

function join(athlete: Athlete) {
  athleteRepository.add(athlete);
}

function leave(id: string) {
  athleteRepository.remove(id);
}

function getFirstFour() {
  const queue = athleteRepository.list();

  const [first, second, third, fourth] = queue;

  const players = [first, second, third, fourth];

  return players;
}

export const queueService = {
  join,
  leave,
  getFirstFour,
};
