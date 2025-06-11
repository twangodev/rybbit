import { Time } from "./types";

export function isPastMinutesMode(time: Time) {
  return time.mode === "past-minutes";
}
