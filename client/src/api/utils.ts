import { DateTime } from "luxon";
import { Time } from "../components/DateSelector/types";
import axios, { AxiosRequestConfig } from "axios";
import { BACKEND_URL } from "../lib/const";

export function getStartAndEndDate(time: Time) {
  if (time.mode === "range") {
    return { startDate: time.startDate, endDate: time.endDate };
  }
  if (time.mode === "week") {
    return {
      startDate: time.week,
      endDate: DateTime.fromISO(time.week).endOf("week").toISODate(),
    };
  }
  if (time.mode === "month") {
    return {
      startDate: time.month,
      endDate: DateTime.fromISO(time.month).endOf("month").toISODate(),
    };
  }
  if (time.mode === "year") {
    return {
      startDate: time.year,
      endDate: DateTime.fromISO(time.year).endOf("year").toISODate(),
    };
  }
  if (time.mode === "all-time") {
    return { startDate: null, endDate: null };
  }
  if (time.mode === "last-24-hours") {
    return { startDate: null, endDate: null };
  }
  return { startDate: time.day, endDate: time.day };
}

export async function authedFetch<T>(
  url: string,
  params?: Record<string, any>,
  config: AxiosRequestConfig = {}
): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${BACKEND_URL}${url}`;

  try {
    const response = await axios({
      url: fullUrl,
      params,
      withCredentials: true,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}
