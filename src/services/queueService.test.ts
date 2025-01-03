import { describe, test, expect, vi } from "vitest";

import { queueService } from "./queueService.js";
import { Athlete } from "../models/athleteModel.js";

const atheleteRepositoryListMock = vi.fn();
const atheleteRepositoryAddMock = vi.fn();
const atheleteRepositoryRemoveMock = vi.fn();

vi.mock("../repositories/athleteRepository.js", () => {
  return {
    athleteRepository: {
      list: () => atheleteRepositoryListMock(),
      add: (athelete: Athlete) => atheleteRepositoryAddMock(athelete),
      remove: (id: string) => atheleteRepositoryRemoveMock(id),
    },
  };
});

describe("Queue Service", () => {
  test("should add an athlete in queue list", () => {
    queueService.join({ id: "999", name: "expensive player" });

    expect(atheleteRepositoryAddMock).toHaveBeenCalledWith({
      id: "999",
      name: "expensive player",
    });
  });

  test("should remove an athlete from the queue list", () => {
    queueService.leave("999");

    expect(atheleteRepositoryRemoveMock).toHaveBeenCalledWith("999");
  });

  test("should return the first fourth player from the queue ", () => {
    atheleteRepositoryListMock.mockReturnValue([
      { name: "first" },
      { name: "second" },
      { name: "third" },
      { name: "fourth" },
      { name: "fifth" },
      { name: "sixth" },
    ]);

    const response = queueService.getFirstFour();

    expect(response).toEqual([
      { name: "first" },
      { name: "second" },
      { name: "third" },
      { name: "fourth" },
    ]);
  });
});
