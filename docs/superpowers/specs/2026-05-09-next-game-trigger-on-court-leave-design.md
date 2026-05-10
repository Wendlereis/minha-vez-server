# Next-Game Trigger on Court Leave

**Date:** 2026-05-09  
**Status:** Approved

## Problem

When all athletes finish a game and return to the queue via `court:leave`, the server never fires `court:next-game` for the next four players waiting. The check only lives in `lobbyHandler` (triggered by `lobby:join`), so returning players silently fill the queue without notifying the next group.

## Approach

Extract a `checkAndEmitNextGame(io: Server)` function into `nextGameService` and call it from every place that could make a game available — currently `lobbyHandler` (after join) and `courtHandler` (after leave). This removes duplicated inline logic and ensures the check runs consistently.

## Architecture

All changes are confined to `minha-vez-server`. No frontend changes required.

### Files changed

- `src/services/nextGameService.ts` — add `checkAndEmitNextGame(io)`, keep `hasGameAvailable` as internal helper
- `src/handlers/lobbyHandler.ts` — replace inline check+emit with `checkAndEmitNextGame(io)`
- `src/handlers/courtHandler.ts` — call `checkAndEmitNextGame(io)` after the player rejoins the queue

## Design Details

### `nextGameService.checkAndEmitNextGame`

```ts
function checkAndEmitNextGame(io: Server) {
  if (hasGameAvailable()) {
    const nextGamePlayers = queueService.getFirstFour();
    io.emit(court.nextGame, nextGamePlayers);
  }
}
```

`hasGameAvailable` remains an internal helper (no longer exported). `queueService` and the `court` events constant are imported into `nextGameService`.

### `lobbyHandler` — after `lobby:join`

```ts
// before
if (nextGameService.hasGameAvailable()) {
  const nextGamePlayers = queueService.getFirstFour();
  io.emit(court.nextGame, nextGamePlayers);
}

// after
nextGameService.checkAndEmitNextGame(io);
```

### `courtHandler` — after `court:leave`

```ts
function leave(data: CourtPayload) {
  const player: Athlete = { id: socket.id, ...data };

  courtService.leave(player.id);
  queueService.join(player);

  const lobbyInfo = lobbyService.getInfo();
  io.emit(lobby.list, lobbyInfo);

  nextGameService.checkAndEmitNextGame(io); // NEW
}
```

## Error Handling

No new error paths introduced. If the queue has fewer than 4 players after court leave, `hasGameAvailable` returns false and no event is emitted — same behavior as today.

## Testing

- Existing unit tests for `nextGameService` should be updated to cover `checkAndEmitNextGame`
- Integration: fill queue with 4+ players → start game → all players call `court:leave` → verify `court:next-game` fires for the next four in queue
- Edge: fewer than 4 players in queue after court leave → verify `court:next-game` is NOT emitted
