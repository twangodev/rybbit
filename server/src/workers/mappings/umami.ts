import { ImportMapper } from "../../types/import.js";

export interface UmamiEvent {
  website_id: string; // Ignore
  session_id: string;
  visit_id: string; // ?
  event_id: string; // ?

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
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  referrer_path: string;
  referrer_query: string;
  referrer_domain: string;
  page_title: string;

  gclid: string; // Ignore
  fbclid: string; // Ignore
  msclkid: string; // Ignore
  ttclid: string; // Ignore
  li_fat_id: string; // Ignore
  twclid: string; // Ignore

  event_type: number | string;
  event_name: string;
  tag: string; // Ignore
  distinct_id: string; // user id?
  created_at: string; // ISO date-time string (from DateTime('UTC'))
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
      const [screenWidth, screenHeight] = row.screen.split("x") || [0, 0];

      const referrer = row.referrer_domain
        ? `${row.referrer_domain}${row.referrer_path || ""}${
          row.referrer_query || ""
        }`
        : "";

      const props: Record<string, any> = {};
      if (row.utm_source) props.utm_source = row.utm_source;
      if (row.utm_medium) props.utm_medium = row.utm_medium;
      if (row.utm_campaign) props.utm_campaign = row.utm_campaign;
      if (row.utm_content) props.utm_content = row.utm_content;
      if (row.utm_term) props.utm_term = row.utm_term;

      // Umami: 1 for pageview, 2 for custom event
      const eventType =
        row.event_type === "2" || row.event_type === 2
          ? "custom_event"
          : "pageview";

      return {
        site_id: Number(site),
        timestamp: row.created_at,
        session_id: row.session_id,
        user_id: row.distinct_id,
        hostname: row.hostname,
        pathname: row.url_path,
        querystring: row.url_query,
        url_parameters: {placeholder: "a"},
        page_title: row.page_title,
        referrer: referrer,
        channel: "placeholder",
        browser: row.browser,
        browser_version: "placeholder",
        operating_system: row.os,
        operating_system_version: "placeholder",
        language: row.language,
        country: row.country,
        region: row.region,
        city: row.city,
        lat: 0, // placeholder
        lon: 0, // placeholder
        screen_width: screenWidth ? parseInt(screenWidth, 10) : 0,
        screen_height: screenHeight ? parseInt(screenHeight, 10) : 0,
        device_type: row.device,
        type: eventType,
        event_name: row.event_name,
        props: props,
      };
    });
  }
}
