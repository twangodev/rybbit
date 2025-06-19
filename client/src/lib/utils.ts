import { clsx, type ClassValue } from "clsx";
import { countries } from "countries-list";
import { Duration } from "luxon";
import { twMerge } from "tailwind-merge";
import { userLocale } from "./dateTimeUtils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatter = Intl.NumberFormat(userLocale, {
  notation: "compact",
}).format;

export function formatSecondsAsMinutesAndSeconds(value: number) {
  const duration = Duration.fromMillis(value * 1000);
  const hours = Math.floor(duration.as("hours"));
  const minutes = Math.floor(duration.as("minutes") % 60);
  const seconds = Math.floor(duration.as("seconds") % 60);

  if (hours > 0) {
    return `${hours}hr ${minutes}min`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getCountryName = (countryCode: string) => {
  return countries[countryCode as keyof typeof countries]?.name;
};

export function truncateString(str: string, n = 50) {
  return str.length > n ? str.substring(0, n) + "..." : str;
}

const regionNamesInEnglish = new Intl.DisplayNames(["en"], { type: "region" });
const languageNamesInEnglish = new Intl.DisplayNames(["en"], {
  type: "language",
});

export const getLanguageName = (languageCode: string) => {
  try {
    // Handle codes like "en-US" that have both language and region
    if (languageCode.includes("-")) {
      const [language, region] = languageCode.split("-");
      const languageName = languageNamesInEnglish.of(language);
      const regionName = regionNamesInEnglish.of(region);
      return `${languageName} (${regionName})`;
    }
    // Just a language code
    return languageNamesInEnglish.of(languageCode);
  } catch (error) {
    return languageCode;
  }
};
