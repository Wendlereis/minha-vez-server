import { Athlete } from "../models/athleteModel.js";

import { courtRepository } from "../repositories/courtRepository.js";

function join(player: Athlete) {
  courtRepository.add(player);
}

function leave(id: string) {
  courtRepository.remove(id);
}

export const courtService = {
  join,
  leave,
};
