import { DateTime } from "luxon";

function now() {
  return DateTime.local();
}

function addMinutes(date: DateTime, minutes: number) {
  return date.plus({ minutes });
}

export { now, addMinutes };
