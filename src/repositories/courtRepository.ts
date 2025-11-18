import { Athlete } from "../models/athleteModel.js";

/**
 * Court players repository using Map for O(1) lookup and removal operations.
 * Previous implementation used Array which required O(n) operations for finding and removing players.
 */
const courtPlayers = new Map<string, Athlete>();

/**
 * Returns a new array of all court players.
 * Note: Creates a new array to prevent external modifications to the internal Map.
 */
function list() {
  return Array.from(courtPlayers.values());
}

function add(player: Athlete) {
  courtPlayers.set(player.id, player);
}

/**
 * Removes a player by ID in O(1) time.
 * Previous Array implementation required O(n) findIndex followed by O(n) splice.
 */
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
