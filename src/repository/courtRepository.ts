import { Athlete } from "../model/athleteModel.js";

const courtPlayers: Athlete[] = [];

export function list() {
  return courtPlayers;
}

export function add(player: Athlete) {
  courtPlayers.push(player);
}

export function remove(id: string) {
  const playerLeavingIndex = courtPlayers.findIndex(
    (player) => player.id === id
  );

  if (playerLeavingIndex < 0) {
    return;
  }

  courtPlayers.splice(playerLeavingIndex, 1);
}
