import { ImportMapping } from "../../types/import.js";

interface UmamiEvent {
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
  tag: string; // ?
  distinct_id: string; // user id?
  created_at: string; // ISO date-time string (from DateTime('UTC'))
  job_id: string | null; // Ignore
}

export class UmamiImportMapping implements ImportMapping<UmamiEvent> {
  transform(row: UmamiEvent, headers: string[]): any {
    const [screenWidth, screenHeight] = row.screen?.split("x") || [null, null];

    const referrer = row.referrer_domain
      ? `${row.referrer_domain}${row.referrer_path || ""}${
          row.referrer_query || ""
        }`
      : null;

    const props: Record<string, any> = {};
    if (row.utm_source) props.utm_source = row.utm_source;
    if (row.utm_medium) props.utm_medium = row.utm_medium;
    if (row.utm_campaign) props.utm_campaign = row.utm_campaign;
    if (row.utm_content) props.utm_content = row.utm_content;
    if (row.utm_term) props.utm_term = row.utm_term;
    if (row.gclid) props.gclid = row.gclid;
    if (row.fbclid) props.fbclid = row.fbclid;
    if (row.msclkid) props.msclkid = row.msclkid;
    if (row.ttclid) props.ttclid = row.ttclid;
    if (row.li_fat_id) props.li_fat_id = row.li_fat_id;
    if (row.twclid) props.twclid = row.twclid;
    if (row.tag) props.tag = row.tag;

    // Umami: 1 for pageview, 2 for custom event
    const eventType =
      row.event_type === "2" || row.event_type === 2
        ? "custom_event"
        : "pageview";

    return {
      timestamp: row.created_at,
      session_id: row.session_id,
      user_id: row.distinct_id,
      hostname: row.hostname,
      pathname: row.url_path,
      querystring: row.url_query,
      page_title: row.page_title,
      referrer: referrer,
      browser: row.browser,
      operating_system: row.os,
      language: row.language,
      country: row.country,
      region: row.region,
      city: row.city,
      screen_width: screenWidth ? parseInt(screenWidth, 10) : null,
      screen_height: screenHeight ? parseInt(screenHeight, 10) : null,
      device_type: row.device,
      type: eventType,
      event_name: row.event_name,
      props: JSON.stringify(props),
    };
  }
}
