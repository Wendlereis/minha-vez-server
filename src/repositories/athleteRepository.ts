import { Athlete } from "../models/athleteModel.js";

const athletes: Athlete[] = [];

function add(athlete: Athlete) {
  athletes.push(athlete);
}

function list() {
  return athletes;
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

function size() {
  return athletes.length;
}

export const athleteRepository = {
  add,
  list,
  remove,
  size,
};
