import { ImportMapper } from "../workers/jobs.js";
import { clearSelfReferrer, getAllUrlParams } from "../../tracker/utils.js";
import { getChannel } from "../../tracker/getChannel.js";

export interface UmamiEvent {
  website_id: string; // Ignore
  session_id: string;
  visit_id: string; // Ignore
  event_id: string; // Ignore

  hostname: string;
  browser: string;
  os: string;
  device: string;
  screen: string;
  language: string;
  country: string;
  region: string;
  city: string;

  url_path: string;
  url_query: string;
  utm_source: string; // Ignore, part of url_query
  utm_medium: string; // Ignore, part of url_query
  utm_campaign: string; // Ignore, part of url_query
  utm_content: string; // Ignore, part of url_query
  utm_term: string; // Ignore, part of url_query
  referrer_path: string; // Ignore
  referrer_query: string; // Ignore
  referrer_domain: string;
  page_title: string;

  gclid: string; // Ignore, part of url_query
  fbclid: string; // Ignore, part of url_query
  msclkid: string; // Ignore, part of url_query
  ttclid: string; // Ignore, part of url_query
  li_fat_id: string; // Ignore, part of url_query
  twclid: string; // Ignore, part of url_query

  event_type: number;
  event_name: string;
  tag: string; // Ignore
  distinct_id: string;
  created_at: string;
  job_id: string | null; // Ignore
}

export const umamiHeaders = [
  "website_id",
  "session_id",
  "visit_id",
  "event_id",
  "hostname",
  "browser",
  "os",
  "device",
  "screen",
  "language",
  "country",
  "region",
  "city",
  "url_path",
  "url_query",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "referrer_path",
  "referrer_query",
  "referrer_domain",
  "page_title",
  "gclid",
  "fbclid",
  "msclkid",
  "ttclid",
  "li_fat_id",
  "twclid",
  "event_type",
  "event_name",
  "tag",
  "distinct_id",
  "created_at",
  "job_id"
];

export class UmamiImportMapper implements ImportMapper<UmamiEvent[]> {
  transform(rows: UmamiEvent[], site: string, importId: string) {
    return rows.map(row => {
      const querystring = row.url_query ? `?${row.url_query}` : "";
      const referrer = row.referrer_domain ? `https://${row.referrer_domain}` : "";
      const [screenWidth, screenHeight] = /^\d+x\d+$/.test(row.screen) ? row.screen.split("x") : ["0", "0"];

      // TODO: Handle empty values in Umami data for required columns (e.g., site_id, timestamp, etc.)
      return {
        site_id: Number(site),
        timestamp: row.created_at,
        session_id: row.session_id,
        user_id: row.distinct_id,
        hostname: row.hostname,
        pathname: row.url_path,
        querystring: querystring,
        url_parameters: getAllUrlParams(row.url_query),
        page_title: row.page_title,
        referrer: clearSelfReferrer(referrer, row.hostname.replace(/^www\./, "")),
        channel: getChannel(referrer, querystring, row.hostname),
        browser: row.browser ? row.browser.charAt(0).toUpperCase() + row.browser.slice(1) : "",
        browser_version: "",
        operating_system: row.os ? row.os.trim().split(/\s+/)[0] : "",
        operating_system_version: row.os === "Windows 10" ? "10" : "",
        language: row.language,
        country: row.country,
        region: row.region,
        city: row.city,
        lat: 0,
        lon: 0,
        screen_width: parseInt(screenWidth, 10),
        screen_height: parseInt(screenHeight, 10),
        device_type: row.device ? row.device.charAt(0).toUpperCase() + row.device.slice(1) : "",
        type: row.event_type === 1 ? "pageview" : "custom_event",
        event_name: row.event_type === 1 ? "" : row.event_name,
        props: JSON.parse("{}"),
        lcp: null,
        cls: null,
        inp: null,
        fcp: null,
        ttfb: null,
        import_id: importId,
      };
    });
  }
}
