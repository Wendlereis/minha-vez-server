import { Athlete } from "../domains/athlete.js";

import * as athletesRepository from "../repository/athletes.js";

export function join(athelete: Athlete) {
  athletesRepository.add(athelete);

  return athletesRepository.list();
}

export function leave(id: string) {
  athletesRepository.remove(id);

  return athletesRepository.list();
}
