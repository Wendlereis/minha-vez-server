import { Athlete } from "../models/athleteModel.js";

import { athleteRepository } from "../repositories/athleteRepository.js";

function join(athelete: Athlete) {
  athleteRepository.add(athelete);

  return athleteRepository.list();
}

function leave(id: string) {
  athleteRepository.remove(id);

  return athleteRepository.list();
}

export const queueService = {
  join,
  leave,
};
