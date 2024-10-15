import { Athlete } from "../model/athleteModel.js";

import * as athletesRepository from "../repository/athleteRepository.js";

export function join(athelete: Athlete) {
  athletesRepository.add(athelete);

  return athletesRepository.list();
}

export function leave(id: string) {
  athletesRepository.remove(id);

  return athletesRepository.list();
}
