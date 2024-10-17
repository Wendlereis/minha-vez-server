import { Athlete } from "../model/athleteModel.js";

const athletes: Athlete[] = [];

export function list() {
  return athletes;
}

export function add(athlete: Athlete) {
  athletes.push(athlete);
}

export function remove(id: string) {
  const athleteLeavingIndex = athletes.findIndex(
    (athlete) => athlete.id === id
  );

  if (athleteLeavingIndex < 0) {
    return;
  }

  athletes.splice(athleteLeavingIndex, 1);
}
