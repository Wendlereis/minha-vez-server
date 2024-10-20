import { Athlete } from "../models/athleteModel.js";

const athletes: Athlete[] = [];

function list() {
  return athletes;
}

function add(athlete: Athlete) {
  athletes.push(athlete);
}

function remove(id: string) {
  const athleteLeavingIndex = athletes.findIndex(
    (athlete) => athlete.id === id
  );

  if (athleteLeavingIndex < 0) {
    return;
  }

  athletes.splice(athleteLeavingIndex, 1);
}

export const athleteRepository = {
  list,
  add,
  remove,
};
