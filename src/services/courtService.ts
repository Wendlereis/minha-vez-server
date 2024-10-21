import { Athlete } from "../models/athleteModel.js";

import { courtRepository } from "../repositories/courtRepository.js";

function join(player: Athlete) {
  courtRepository.add(player);

  return courtRepository.list();
}

function leave(id: string) {
  courtRepository.remove(id);

  return courtRepository.list();
}

export const courtService = {
  join,
  leave,
};
