import { describe, test, expect, vi } from "vitest";

import { queueService } from "./queueService.js";
import { Athlete } from "../models/athleteModel.js";

const athleteRepositoryListMock = vi.fn();
const athleteRepositoryAddMock = vi.fn();
const athleteRepositoryRemoveMock = vi.fn();

vi.mock("../repositories/athleteRepository.js", () => {
  return {
    athleteRepository: {
      list: () => athleteRepositoryListMock(),
      add: (athlete: Athlete) => athleteRepositoryAddMock(athlete),
      remove: (id: string) => athleteRepositoryRemoveMock(id),
    },
  };
});

describe("Queue Service", () => {
  test("should add an athlete in queue list", () => {
    queueService.join({ id: "999", name: "expensive player" });

    expect(athleteRepositoryAddMock).toHaveBeenCalledWith({
      id: "999",
      name: "expensive player",
    });
  });

  test("should remove an athlete from the queue list", () => {
    queueService.leave("999");

    expect(athleteRepositoryRemoveMock).toHaveBeenCalledWith("999");
  });

  test("should return the first fourth player from the queue ", () => {
    athleteRepositoryListMock.mockReturnValue([
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
