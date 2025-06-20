import * as cron from "node-cron";
import { cleanupOldSessions } from "../db/postgres/session-cleanup.js";
import { IS_CLOUD } from "../lib/const.js";
import { updateOrganizationsMonthlyUsage } from "./monthly-usage-checker.js";

export async function initializeCronJobs() {
  console.log("Initializing cron jobs...");

  if (IS_CLOUD && process.env.NODE_ENV !== "development") {
    // Schedule the monthly usage checker to run every 5 minutes
    cron.schedule("*/30 * * * *", updateOrganizationsMonthlyUsage);
    updateOrganizationsMonthlyUsage();
  }
  cron.schedule("* * * * *", cleanupOldSessions);

  console.log("Cron jobs initialized successfully");
}
