import { addMinutes, now } from "../libraries/date.js";

import { LobbyPreview } from "../models/lobbyModel.js";

import { athleteRepository } from "../repositories/athleteRepository.js";
import { courtRepository } from "../repositories/courtRepository.js";

const ATHLETES_PER_GAME = 4;
const AVG_GAME_TIME_MINUTES = 20;

function calculateNextGameDate(queueSize: number) {
  const gamesCount = Math.floor(queueSize / ATHLETES_PER_GAME);

  const minutesUntilNextGame = gamesCount * AVG_GAME_TIME_MINUTES;

  return addMinutes(now(), minutesUntilNextGame).toJSDate();
}

function getPreview() {
  const queueSize = athleteRepository.size();

  const nextGameDate = calculateNextGameDate(queueSize);

  const lobbyPreview: LobbyPreview = { queueSize, nextGameDate };

  return lobbyPreview;
}

function getList() {
  const court = courtRepository.list();

  const atheletes = athleteRepository.list();

  const queueSize = athleteRepository.size();

  const nextGameDate = calculateNextGameDate(queueSize);

  return { atheletes, court, nextGameDate };
}

export const lobbyService = {
  getPreview,
  getList,
};
