import { Athlete } from "./athleteModel.js";

export type PlayerStatus = "pending" | "accepted" | "declined";

export interface PendingPlayer {
  athlete: Athlete;
  status: PlayerStatus;
}

export interface PendingGame {
  id: string; // Add an ID just in case
  players: PendingPlayer[];
  timeoutId?: NodeJS.Timeout;
}
