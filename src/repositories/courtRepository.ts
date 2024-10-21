import { Athlete } from "../models/athleteModel.js";

const courtPlayers: Athlete[] = [];

function list() {
  return courtPlayers;
}

function add(player: Athlete) {
  courtPlayers.push(player);
}

function remove(id: string) {
  const playerLeavingIndex = courtPlayers.findIndex(
    (player) => player.id === id
  );

  if (playerLeavingIndex < 0) {
    return;
  }

  courtPlayers.splice(playerLeavingIndex, 1);
}

export const courtRepository = {
  list,
  add,
  remove,
};
