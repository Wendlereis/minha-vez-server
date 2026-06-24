import { Athlete } from "../models/athleteModel.js";

export type CourtPlayer = Athlete & { status: 'playing' | 'finishing'; rejoinQueue?: boolean };

const courtPlayers: CourtPlayer[] = [];

function list() {
  return courtPlayers;
}

function add(player: Athlete) {
  courtPlayers.push({ ...player, status: 'playing' });
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

function setFinishing(id: string, rejoinQueue: boolean) {
  const player = courtPlayers.find((p) => p.id === id);
  if (player) {
    player.status = 'finishing';
    player.rejoinQueue = rejoinQueue;
  }
}

function clear() {
  courtPlayers.length = 0;
}

export const courtRepository = {
  list,
  add,
  remove,
  setFinishing,
  clear,
};
