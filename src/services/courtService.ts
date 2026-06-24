import { Athlete } from "../models/athleteModel.js";

import { courtRepository } from "../repositories/courtRepository.js";

function join(player: Athlete) {
  courtRepository.add(player);
}

function leave(id: string) {
  courtRepository.remove(id);
}

function requestLeave(id: string, rejoinQueue: boolean) {
  courtRepository.setFinishing(id, rejoinQueue);
  
  const players = courtRepository.list();
  if (players.length > 0 && players.every(p => p.status === 'finishing')) {
    const toRejoin = players.filter(p => p.rejoinQueue);
    courtRepository.clear();
    return { cleared: true, toRejoin };
  }
  return { cleared: false, toRejoin: [] };
}

export const courtService = {
  join,
  leave,
  requestLeave,
};
