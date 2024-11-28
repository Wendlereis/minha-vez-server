import { addMinutes, now } from "../libraries/date.js";

import { LobbyPreview } from "../models/lobbyModel.js";

import { athleteRepository } from "../repositories/athleteRepository.js";

const ATHLETES_PER_GAME = 4;
const AVG_GAME_TIME_MINUTES = 20;

function getPreview() {
  const queueSize = athleteRepository.size();

  const gamesCount = Math.floor(queueSize / ATHLETES_PER_GAME);

  const minutesUntilNextGame = gamesCount * AVG_GAME_TIME_MINUTES;

  const nextGameDate = addMinutes(now(), minutesUntilNextGame).toJSDate();

  const lobbyPreview: LobbyPreview = { queueSize, nextGameDate };

  return lobbyPreview;
}

export const lobbyService = {
  getPreview,
};
