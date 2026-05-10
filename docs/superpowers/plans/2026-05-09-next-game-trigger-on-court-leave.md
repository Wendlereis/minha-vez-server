# Next-Game Trigger on Court Leave — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the bug where `court:next-game` is never emitted when athletes leave the court and the queue has 4+ players waiting.

**Architecture:** Extract `checkAndEmitNextGame(io)` into `nextGameService`, replacing the inline check-and-emit logic in `lobbyHandler` and adding the missing call in `courtHandler`. `hasGameAvailable` becomes an internal helper (not exported).

**Tech Stack:** TypeScript, Socket.IO 4, Vitest

---

## File Map

| File | Change |
|---|---|
| `src/services/nextGameService.ts` | Add `checkAndEmitNextGame(io)`, internalize `hasGameAvailable` |
| `src/services/nextGameService.test.ts` | Replace `hasGameAvailable` tests with `checkAndEmitNextGame` tests |
| `src/handlers/lobbyHandler.ts` | Replace inline check+emit with `checkAndEmitNextGame(io)` |
| `src/handlers/courtHandler.ts` | Add `checkAndEmitNextGame(io)` call after `court:leave` |
| `src/handlers/handlers.test.ts` | Mock `checkAndEmitNextGame` instead of `hasGameAvailable`; add court-leave next-game test |

---

### Task 1: Add `checkAndEmitNextGame` to `nextGameService`

**Files:**
- Modify: `src/services/nextGameService.ts`
- Modify: `src/services/nextGameService.test.ts`

- [ ] **Step 1: Write failing tests for `checkAndEmitNextGame`**

Replace the entire contents of `src/services/nextGameService.test.ts` with:

```ts
import { describe, expect, test, vi } from "vitest";
import { Server } from "socket.io";

import { nextGameService } from "./nextGameService";

const athleteListMock = vi.fn();
const courtListMock = vi.fn();
const queueServiceGetFirstFourMock = vi.fn();

vi.mock("../repositories/athleteRepository.js", () => ({
  athleteRepository: { list: () => athleteListMock() },
}));

vi.mock("../repositories/courtRepository.js", () => ({
  courtRepository: { list: () => courtListMock() },
}));

vi.mock("./queueService.js", () => ({
  queueService: { getFirstFour: () => queueServiceGetFirstFourMock() },
}));

const FOUR_PLAYERS = [
  { id: "1", name: "first", gender: "female" },
  { id: "2", name: "second", gender: "female" },
  { id: "3", name: "third", gender: "female" },
  { id: "4", name: "fourth", gender: "female" },
];

describe("Next Game Service", () => {
  describe("checkAndEmitNextGame", () => {
    test("should emit court:next-game when court is empty and 4+ players in queue", () => {
      courtListMock.mockReturnValue([]);
      athleteListMock.mockReturnValue([
        ...FOUR_PLAYERS,
        { id: "5", name: "fifth", gender: "male" },
      ]);
      queueServiceGetFirstFourMock.mockReturnValue(FOUR_PLAYERS);

      const ioMock = { emit: vi.fn() } as unknown as Server;

      nextGameService.checkAndEmitNextGame(ioMock);

      expect(ioMock.emit).toHaveBeenCalledWith("court:next-game", FOUR_PLAYERS);
    });

    test("should not emit when court is occupied", () => {
      courtListMock.mockReturnValue(FOUR_PLAYERS);
      athleteListMock.mockReturnValue([{ id: "5", name: "fifth", gender: "male" }]);

      const ioMock = { emit: vi.fn() } as unknown as Server;

      nextGameService.checkAndEmitNextGame(ioMock);

      expect(ioMock.emit).not.toHaveBeenCalled();
    });

    test("should not emit when fewer than 4 players are in the queue", () => {
      courtListMock.mockReturnValue([]);
      athleteListMock.mockReturnValue([
        { id: "1", name: "first", gender: "female" },
        { id: "2", name: "second", gender: "female" },
      ]);

      const ioMock = { emit: vi.fn() } as unknown as Server;

      nextGameService.checkAndEmitNextGame(ioMock);

      expect(ioMock.emit).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/services/nextGameService.test.ts
```

Expected: FAIL — `nextGameService.checkAndEmitNextGame is not a function`

- [ ] **Step 3: Implement `checkAndEmitNextGame` in `nextGameService.ts`**

Replace the entire contents of `src/services/nextGameService.ts` with:

```ts
import { Server } from "socket.io";

import { athleteRepository } from "../repositories/athleteRepository.js";
import { courtRepository } from "../repositories/courtRepository.js";
import { queueService } from "./queueService.js";
import { court } from "../handlers/events.js";

function hasGameAvailable() {
  const courtPlayers = courtRepository.list();
  const queue = athleteRepository.list();

  const hasCourtAvailable = courtPlayers.length === 0;
  const hasEnoughPlayers = queue.length >= 4;

  return hasCourtAvailable && hasEnoughPlayers;
}

function checkAndEmitNextGame(io: Server) {
  if (hasGameAvailable()) {
    const nextGamePlayers = queueService.getFirstFour();
    io.emit(court.nextGame, nextGamePlayers);
  }
}

export const nextGameService = {
  hasGameAvailable,
  checkAndEmitNextGame,
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/services/nextGameService.test.ts
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add src/services/nextGameService.ts src/services/nextGameService.test.ts
git commit -m "feat: add checkAndEmitNextGame to nextGameService"
```

---

### Task 2: Refactor `lobbyHandler` to use `checkAndEmitNextGame`

**Files:**
- Modify: `src/handlers/lobbyHandler.ts`
- Modify: `src/handlers/handlers.test.ts`

- [ ] **Step 1: Update the handler test to use the new mock**

In `src/handlers/handlers.test.ts`, make these two edits:

**Edit 1** — replace the `nextGameServiceHasGameAvailableMock` declaration and remove `queueServiceGetFirstFourMock`:

```ts
// Remove this line:
const nextGameServiceHasGameAvailableMock = vi.mocked(
  nextGameService.hasGameAvailable
);

// Remove this line:
const queueServiceGetFirstFourMock = vi.mocked(queueService.getFirstFour);

// Add this line in their place:
const nextGameServiceCheckAndEmitNextGameMock = vi.mocked(
  nextGameService.checkAndEmitNextGame
);
```

**Edit 2** — replace the "should emit the next-game event when join the lobby" test body:

```ts
it("should emit the next-game event when join the lobby", async () => {
  lobbyServiceGetInfoMock.mockReturnValue({
    athletes: [
      { id: "1", name: "first", gender: "female" },
      { id: "2", name: "second", gender: "female" },
      { id: "3", name: "third", gender: "female" },
      { id: "4", name: "fourth", gender: "female" },
      { id: "5", name: "expensive player", gender: "female" },
    ],
    court: [],
    nextGameDate: new Date("2023-07-14T00:00:00.000Z"),
  });

  nextGameServiceCheckAndEmitNextGameMock.mockImplementation((io) => {
    io.emit("court:next-game", [
      { id: "1", name: "first", gender: "female" },
      { id: "2", name: "second", gender: "female" },
      { id: "3", name: "third", gender: "female" },
      { id: "4", name: "fourth", gender: "female" },
    ]);
  });

  clientSocket.emit("lobby:join", { name: "expensive player" });

  const nextGame = await waitForEventToBeEmitted(clientSocket, "court:next-game");

  expect(nextGame).toEqual([
    { id: "1", name: "first", gender: "female" },
    { id: "2", name: "second", gender: "female" },
    { id: "3", name: "third", gender: "female" },
    { id: "4", name: "fourth", gender: "female" },
  ]);
});
```

- [ ] **Step 2: Run tests to verify the handler test now fails**

```bash
npx vitest run src/handlers/handlers.test.ts
```

Expected: FAIL — `checkAndEmitNextGame` is not called yet by `lobbyHandler`

- [ ] **Step 3: Update `lobbyHandler.ts` to call `checkAndEmitNextGame`**

Replace the entire contents of `src/handlers/lobbyHandler.ts` with:

```ts
import { Server, Socket } from "socket.io";

import { Athlete, Gender } from "../models/athleteModel.js";

import { queueService } from "../services/queueService.js";
import { lobbyService } from "../services/lobbyService.js";
import { nextGameService } from "../services/nextGameService.js";

import { lobby } from "./events.js";

interface QueuePayload {
  name: string;
  gender: Gender;
}

export function registerLobbyHandlers(io: Server, socket: Socket) {
  function join(data: QueuePayload) {
    const athlete: Athlete = {
      id: socket.id,
      name: data.name,
      gender: data.gender,
    };

    queueService.join(athlete);

    const lobbyList = lobbyService.getInfo();

    io.emit(lobby.list, lobbyList);

    nextGameService.checkAndEmitNextGame(io);
  }

  function leave() {
    queueService.leave(socket.id);

    const lobbyList = lobbyService.getInfo();

    io.emit(lobby.list, lobbyList);
  }

  socket.on(lobby.join, join);
  socket.on(lobby.leave, leave);
}
```

- [ ] **Step 4: Run all tests to verify they pass**

```bash
npx vitest run
```

Expected: PASS — 25 tests (same count, different implementation)

- [ ] **Step 5: Commit**

```bash
git add src/handlers/lobbyHandler.ts src/handlers/handlers.test.ts
git commit -m "refactor: use checkAndEmitNextGame in lobbyHandler"
```

---

### Task 3: Fix `courtHandler` — trigger next-game on court leave

**Files:**
- Modify: `src/handlers/courtHandler.ts`
- Modify: `src/handlers/handlers.test.ts`
- Modify: `src/services/nextGameService.ts` (remove `hasGameAvailable` from exports)
- Modify: `src/services/nextGameService.test.ts` (already clean — no change needed)

- [ ] **Step 1: Write a failing test for the bug fix**

In `src/handlers/handlers.test.ts`, add the following test inside the `"Court Handler"` describe block, after the existing `"should leave the court"` test:

```ts
it("should emit the next-game event when leaving court with enough players in queue", async () => {
  lobbyServiceGetInfoMock.mockReturnValue({
    athletes: [
      { id: "1", name: "first", gender: "female" },
      { id: "2", name: "second", gender: "female" },
      { id: "3", name: "third", gender: "female" },
      { id: "4", name: "fourth", gender: "female" },
    ],
    court: [],
    nextGameDate: new Date("2023-07-14T00:00:00.000Z"),
  });

  nextGameServiceCheckAndEmitNextGameMock.mockImplementation((io) => {
    io.emit("court:next-game", [
      { id: "1", name: "first", gender: "female" },
      { id: "2", name: "second", gender: "female" },
      { id: "3", name: "third", gender: "female" },
      { id: "4", name: "fourth", gender: "female" },
    ]);
  });

  clientSocket.emit("court:leave", { name: "expensive player", gender: "female" });

  const nextGame = await waitForEventToBeEmitted(clientSocket, "court:next-game");

  expect(nextGame).toEqual([
    { id: "1", name: "first", gender: "female" },
    { id: "2", name: "second", gender: "female" },
    { id: "3", name: "third", gender: "female" },
    { id: "4", name: "fourth", gender: "female" },
  ]);
});
```

- [ ] **Step 2: Run tests to verify the new test fails**

```bash
npx vitest run src/handlers/handlers.test.ts
```

Expected: FAIL — new test times out because `court:next-game` is never emitted

- [ ] **Step 3: Update `courtHandler.ts` to call `checkAndEmitNextGame` after `court:leave`**

Replace the entire contents of `src/handlers/courtHandler.ts` with:

```ts
import { Server, Socket } from "socket.io";

import { Athlete, Gender } from "../models/athleteModel.js";

import { courtService } from "../services/courtService.js";
import { queueService } from "../services/queueService.js";
import { lobbyService } from "../services/lobbyService.js";
import { nextGameService } from "../services/nextGameService.js";

import { court, lobby } from "./events.js";

interface CourtPayload {
  name: string;
  gender: Gender;
}

export function registerCourtHandlers(io: Server, socket: Socket) {
  function join(data: CourtPayload) {
    const player: Athlete = {
      id: socket.id,
      name: data.name,
      gender: data.gender,
    };

    courtService.join(player);

    queueService.leave(player.id);

    const lobbyInfo = lobbyService.getInfo();

    io.emit(lobby.list, lobbyInfo);
  }

  function leave(data: CourtPayload) {
    const player: Athlete = {
      id: socket.id,
      name: data.name,
      gender: data.gender,
    };

    courtService.leave(player.id);

    queueService.join(player);

    const lobbyInfo = lobbyService.getInfo();

    io.emit(lobby.list, lobbyInfo);

    nextGameService.checkAndEmitNextGame(io);
  }

  socket.on(court.join, join);
  socket.on(court.leave, leave);
}
```

- [ ] **Step 4: Run all tests to verify they pass**

```bash
npx vitest run
```

Expected: PASS — 26 tests (25 original + 1 new)

- [ ] **Step 5: Remove `hasGameAvailable` from `nextGameService` exports**

In `src/services/nextGameService.ts`, update the export at the bottom to remove `hasGameAvailable`:

```ts
export const nextGameService = {
  checkAndEmitNextGame,
};
```

- [ ] **Step 6: Run all tests to confirm nothing broke**

```bash
npx vitest run
```

Expected: PASS — 26 tests

- [ ] **Step 7: Commit**

```bash
git add src/handlers/courtHandler.ts src/handlers/handlers.test.ts src/services/nextGameService.ts
git commit -m "fix: emit court:next-game when athletes leave court and queue has 4+ players"
```
