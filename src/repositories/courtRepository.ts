import { Athlete } from "../models/athleteModel.js";

const courtPlayers = new Map<string, Athlete>();

function list() {
  return Array.from(courtPlayers.values());
}

function add(player: Athlete) {
  courtPlayers.set(player.id, player);
}

function remove(id: string) {
  courtPlayers.delete(id);
}

function size() {
  return courtPlayers.size;
}

export const courtRepository = {
  list,
  add,
  remove,
  size,
};
