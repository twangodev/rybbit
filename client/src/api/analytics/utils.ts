import { Time } from "../../components/DateSelector/types";
import { getStartAndEndDate } from "../utils";
import { timeZone } from "../../lib/dateTimeUtils";
import { isPastMinutesMode } from "../../components/DateSelector/utils";

/**
 * Generates URL query parameters for time filtering
 * @param time Time object from store
 * @returns URL query string with time parameters
 */
export function getQueryTimeParams(time: Time): string {
  const params = new URLSearchParams();

  if (isPastMinutesMode(time)) {
    params.append("pastMinutesStart", time.pastMinutesStart.toString());
    params.append("pastMinutesEnd", time.pastMinutesEnd.toString());
    params.append("timeZone", timeZone);
    return params.toString();
  }

  // Regular date-based approach for other modes
  const { startDate, endDate } = getStartAndEndDate(time);

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  params.append("timeZone", timeZone);

  return params.toString();
}
