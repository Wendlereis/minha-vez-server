import { Athlete } from "../models/athleteModel.js";

const athletes = new Map<string, Athlete>();

function add(athlete: Athlete) {
  athletes.set(athlete.id, athlete);
}

function list() {
  return Array.from(athletes.values());
}

function remove(id: string) {
  athletes.delete(id);
}

function size() {
  return athletes.size;
}

export const athleteRepository = {
  add,
  list,
  remove,
  size,
};
