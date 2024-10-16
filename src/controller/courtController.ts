import { Athlete } from "../model/athleteModel.js";

import * as courtRepository from "../repository/courtRepository.js";

export function join(player: Athlete) {
  courtRepository.add(player);

  return courtRepository.list();
}

export function leave(id: string) {
  courtRepository.remove(id);

  return courtRepository.list();
}
