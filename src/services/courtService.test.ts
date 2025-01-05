import { describe, test, expect, vi } from "vitest";

import { Athlete } from "../models/athleteModel.js";

import { courtService } from "./courtService.js";

const courtRepositoryAddMock = vi.fn();
const courtRepositoryRemoveMock = vi.fn();

vi.mock("../repositories/courtRepository.js", () => {
  return {
    courtRepository: {
      add: (athelete: Athlete) => courtRepositoryAddMock(athelete),
      remove: (id: string) => courtRepositoryRemoveMock(id),
    },
  };
});

describe("Court Service", () => {
  test("should add an athlete in court list", () => {
    courtService.join({ id: "athlete-id", name: "expensive player" });

    expect(courtRepositoryAddMock).toHaveBeenCalledWith({
      id: "athlete-id",
      name: "expensive player",
    });
  });

  test("should remove an athlete from the court list", () => {
    courtService.leave("athlete-id");

    expect(courtRepositoryRemoveMock).toHaveBeenCalledWith("athlete-id");
  });
});
