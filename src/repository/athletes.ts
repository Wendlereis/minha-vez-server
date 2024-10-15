import { Athlete } from "../domains/athlete.js";

const athletes: Athlete[] = [];

export function list() {
  return athletes;
}

export function add(athlete: Athlete) {
  athletes.push(athlete);
}

export function remove(id: string) {
  const playerLeavingIndex = athletes.findIndex((athlete) => (athlete.id = id));

  athletes.splice(playerLeavingIndex, 1);
}
