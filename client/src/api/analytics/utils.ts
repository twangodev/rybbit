import { Time } from "../../components/DateSelector/types";
import { getStartAndEndDate } from "../utils";
import { timeZone } from "../../lib/dateTimeUtils";

/**
 * Generates URL query parameters for time filtering
 * @param time Time object from store
 * @returns URL query string with time parameters
 */
export function getQueryTimeParams(time: Time): string {
  const params = new URLSearchParams();

  // Handle last-24-hours mode differently
  if (time.mode === "last-24-hours") {
    // Use pastMinutesStart/pastMinutesEnd parameters instead of date range
    params.append("pastMinutesStart", "1440"); // 24 hours ago (24 * 60 minutes)
    params.append("pastMinutesEnd", "0"); // now
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
