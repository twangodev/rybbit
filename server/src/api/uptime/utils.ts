// Utility functions for uptime monitoring queries

// Convert ISO date/datetime to ClickHouse format
export function toClickHouseDateTime(dateString: string): string {
  // If it's just a date (YYYY-MM-DD), add time as 00:00:00
  if (dateString.length === 10) {
    return `${dateString} 00:00:00`;
  }
  // Otherwise, convert ISO datetime to ClickHouse format (YYYY-MM-DD HH:MM:SS)
  return dateString.replace("T", " ").replace(/\.\d{3}Z$/, "");
}
