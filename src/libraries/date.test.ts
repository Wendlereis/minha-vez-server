import { describe, test, expect } from "vitest";
import { Settings } from "luxon";

import { addMinutes, now } from "./date";

Settings.now = () => new Date("2023-07-14").valueOf();
Settings.defaultZone = "UTC";

describe("Date Library", () => {
  test("should call now", () => {
    const date = now();

    expect(date.toISO()).toEqual("2023-07-14T00:00:00.000Z");
  });

  test("should add 20 minutes to a date", () => {
    const date = addMinutes(now(), 20);

    expect(date.toISO()).toEqual("2023-07-14T00:20:00.000Z");
  });
});
