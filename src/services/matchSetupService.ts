import { Server } from "socket.io";
import { PendingGame, PendingPlayer } from "../models/matchSetupModel.js";
import { court } from "../handlers/events.js";
import { queueService } from "./queueService.js";
import { lobbyService } from "./lobbyService.js";
import { lobby } from "../handlers/events.js";
import { courtService } from "./courtService.js";

let currentPendingGame: PendingGame | null = null;

function clearPendingGame() {
  if (currentPendingGame?.timeoutId) {
    clearTimeout(currentPendingGame.timeoutId);
  }
  currentPendingGame = null;
}

function handleTimeout(io: Server) {
  if (!currentPendingGame) return;

  // Anyone who is still pending gets declined
  currentPendingGame.players.forEach((p) => {
    if (p.status === "pending") {
      p.status = "declined";
      // Move to end of queue
      queueService.leave(p.athlete.id);
      queueService.join(p.athlete);
    }
  });

  io.emit(lobby.list, lobbyService.getInfo());

  // Try to find replacements for declined players
  fillPendingGame(io);
}

function emitUpdate(io: Server) {
  if (currentPendingGame) {
    // We send the players array with their statuses
    io.emit(court.nextGame, currentPendingGame.players);
  }
}

function createPendingGame(io: Server) {
  if (currentPendingGame) {
    return; // Already a game pending
  }

  const players = queueService.getFirstFour().map((athlete) => ({
    athlete,
    status: "pending" as const,
  }));

  currentPendingGame = {
    id: Date.now().toString(),
    players,
  };

  currentPendingGame.timeoutId = setTimeout(() => handleTimeout(io), 60000);

  emitUpdate(io);
}

function fillPendingGame(io: Server) {
  if (!currentPendingGame) return;

  const acceptedPlayers = currentPendingGame.players.filter((p) => p.status === "accepted");
  const needed = 4 - acceptedPlayers.length;

  if (needed === 0) {
    // All 4 accepted! Move them to court.
    acceptedPlayers.forEach((p) => {
      courtService.join(p.athlete);
      queueService.leave(p.athlete.id);
    });
    clearPendingGame();
    io.emit(lobby.list, lobbyService.getInfo());
    return;
  }

  // We need more players. We need to find players in the queue who are NOT already in the pending game.
  const queuePlayers = queueService.getAll();
  const pendingIds = new Set(currentPendingGame.players.map((p) => p.athlete.id));

  const availablePlayers = queuePlayers.filter((p) => !pendingIds.has(p.id));

  if (availablePlayers.length < needed) {
    // Not enough players to fill the game. It just waits for new players.
    // Clear the timeout because we are waiting indefinitely for new people to join the queue.
    if (currentPendingGame.timeoutId) {
      clearTimeout(currentPendingGame.timeoutId);
      currentPendingGame.timeoutId = undefined;
    }
    emitUpdate(io);
    return;
  }

  // We have enough players. Add the next 'needed' players as pending.
  const newPending = availablePlayers.slice(0, needed).map((athlete) => ({
    athlete,
    status: "pending" as const,
  }));

  // Retain only accepted players and add the new pending ones
  currentPendingGame.players = [...acceptedPlayers, ...newPending];

  // Restart the timer
  if (currentPendingGame.timeoutId) clearTimeout(currentPendingGame.timeoutId);
  currentPendingGame.timeoutId = setTimeout(() => handleTimeout(io), 60000);

  emitUpdate(io);
}

function acceptInvite(io: Server, playerId: string) {
  if (!currentPendingGame) return;

  const player = currentPendingGame.players.find((p) => p.athlete.id === playerId);
  if (player && player.status === "pending") {
    player.status = "accepted";
    
    // Check if we can start the game
    const allAccepted = currentPendingGame.players.every((p) => p.status === "accepted");
    if (allAccepted && currentPendingGame.players.length === 4) {
      currentPendingGame.players.forEach((p) => {
        courtService.join(p.athlete);
        queueService.leave(p.athlete.id);
      });
      clearPendingGame();
      io.emit(lobby.list, lobbyService.getInfo());
      // we could emit a 'court:started' if needed, but lobby list update is enough.
    } else {
      emitUpdate(io);
    }
  }
}

function declineInvite(io: Server, playerId: string) {
  if (!currentPendingGame) return;

  const playerIndex = currentPendingGame.players.findIndex((p) => p.athlete.id === playerId);
  if (playerIndex >= 0) {
    const player = currentPendingGame.players[playerIndex];
    if (player.status !== "declined") {
      player.status = "declined";
      
      // Move to end of queue
      queueService.leave(player.athlete.id);
      queueService.join(player.athlete);
      io.emit(lobby.list, lobbyService.getInfo());

      fillPendingGame(io);
    }
  }
}

function handleNewPlayerInQueue(io: Server) {
  // If there's a pending game waiting for players, try to fill it
  if (currentPendingGame) {
    const pendingCount = currentPendingGame.players.filter((p) => p.status === "pending").length;
    const acceptedCount = currentPendingGame.players.filter((p) => p.status === "accepted").length;
    if (pendingCount + acceptedCount < 4) {
      fillPendingGame(io);
    }
  }
}

export const matchSetupService = {
  createPendingGame,
  acceptInvite,
  declineInvite,
  clearPendingGame,
  handleNewPlayerInQueue,
  getCurrentPendingGame: () => currentPendingGame,
};
