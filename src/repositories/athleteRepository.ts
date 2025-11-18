import { Athlete } from "../models/athleteModel.js";

/**
 * Athletes repository using Map for O(1) lookup and removal operations.
 * Previous implementation used Array which required O(n) operations for finding and removing athletes.
 */
const athletes = new Map<string, Athlete>();

function add(athlete: Athlete) {
  athletes.set(athlete.id, athlete);
}

/**
 * Returns a new array of all athletes.
 * Note: Creates a new array to prevent external modifications to the internal Map.
 */
function list() {
  return Array.from(athletes.values());
}

/**
 * Removes an athlete by ID in O(1) time.
 * Previous Array implementation required O(n) findIndex followed by O(n) splice.
 */
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
