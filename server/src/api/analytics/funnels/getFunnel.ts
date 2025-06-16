import { FastifyRequest } from "fastify";
import { FastifyReply } from "fastify";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import {
  getTimeStatement,
  processResults,
  getFilterStatement,
  patternToRegex,
} from "../utils.js";
import { getUserHasAccessToSitePublic } from "../../../lib/auth-utils.js";
import SqlString from "sqlstring";
import { Filter } from "../types.js";

type FunnelStep = {
  value: string;
  name?: string;
  type: "page" | "event";
  eventPropertyKey?: string;
  eventPropertyValue?: string | number | boolean;
};

type Funnel = {
  steps: FunnelStep[];
  startDate: string;
  endDate: string;
  timeZone: string;
  filters?: Filter[];
};

type FunnelResponse = {
  step_number: number;
  step_name: string;
  visitors: number;
  conversion_rate: number;
  dropoff_rate: number;
};

export async function getFunnel(
  request: FastifyRequest<{
    Body: Funnel;
    Params: {
      site: string;
    };
  }>,
  reply: FastifyReply
) {
  const { steps, startDate, endDate, timeZone, filters } = request.body;
  const { site } = request.params;

  // Validate request
  if (!steps || steps.length < 2) {
    return reply
      .status(400)
      .send({ error: "At least 2 steps are required for a funnel" });
  }

  // Check user access to site
  const userHasAccessToSite = await getUserHasAccessToSitePublic(request, site);
  if (!userHasAccessToSite) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  // Build funnel query
  try {
    // Create the time statement for the date range
    const timeStatement = getTimeStatement({
      startDate,
      endDate,
      timeZone,
    });

    // Get filter conditions using the existing utility function
    const filterConditions =
      filters && filters.length > 0
        ? getFilterStatement(JSON.stringify(filters))
        : "";

    // Build conditional statements for each step
    const stepConditions = steps.map((step) => {
      if (step.type === "page") {
        // Use pattern matching for page paths to support wildcards
        return `type = 'pageview' AND match(pathname, ${SqlString.escape(
          patternToRegex(step.value)
        )})`;
      } else {
        // Start with the base event match condition
        let eventClause = `type = 'custom_event' AND event_name = ${SqlString.escape(
          step.value
        )}`;

        // Add property matching if both key and value are provided
        if (step.eventPropertyKey && step.eventPropertyValue !== undefined) {
          // Access the sub-column directly for native JSON type
          const propValueAccessor = `props.${SqlString.escapeId(
            step.eventPropertyKey
          )}`;

          // Comparison needs to handle the dynamic type returned
          // Let ClickHouse handle the comparison based on the provided value type
          if (typeof step.eventPropertyValue === "string") {
            eventClause += ` AND toString(${propValueAccessor}) = ${SqlString.escape(
              step.eventPropertyValue
            )}`;
          } else if (typeof step.eventPropertyValue === "number") {
            // Use toFloat64 or toInt* depending on expected number type
            eventClause += ` AND toFloat64OrNull(${propValueAccessor}) = ${SqlString.escape(
              step.eventPropertyValue
            )}`;
          } else if (typeof step.eventPropertyValue === "boolean") {
            // Booleans might be stored as 0/1 or true/false in JSON
            // Comparing toUInt8 seems robust
            eventClause += ` AND toUInt8OrNull(${propValueAccessor}) = ${
              step.eventPropertyValue ? 1 : 0
            }`;
          }
        }

        return eventClause;
      }
    });

    // Build the funnel query - first part to calculate visitors at each step
    const query = `
    WITH
    -- Get all user actions in the time period
    UserActions AS (
      SELECT
        user_id,
        timestamp,
        pathname,
        event_name,
        type,
        props
      FROM events
      WHERE
        site_id = {siteId:Int32}
        ${timeStatement}
        ${filterConditions}
        AND user_id != ''
    ),
    -- Initial step (all users who completed step 1)
    Step1 AS (
      SELECT DISTINCT
        user_id,
        min(timestamp) as step_time
      FROM UserActions
      WHERE ${stepConditions[0]}
      GROUP BY user_id
    )
    
    -- Calculate each funnel step
    ${steps
      .slice(1)
      .map(
        (step, index) => `
    , Step${index + 2} AS (
      SELECT DISTINCT
        s${index + 1}.user_id,
        min(ua.timestamp) as step_time
      FROM Step${index + 1} s${index + 1}
      JOIN UserActions ua ON s${index + 1}.user_id = ua.user_id
      WHERE 
        ua.timestamp > s${index + 1}.step_time
        AND ${stepConditions[index + 1]}
      GROUP BY s${index + 1}.user_id
    )
    `
      )
      .join("")}
    
    -- Calculate visitor count for each step
    , StepCounts AS (
      ${steps
        .map(
          (step, index) => `
          SELECT
            ${index + 1} as step_number,
            ${SqlString.escape(step.name || step.value)} as step_name,
            count(DISTINCT user_id) as visitors
          FROM Step${index + 1}
        `
        )
        .join("\nUNION ALL\n")}
    )
    
    -- Final results with calculated conversion and dropoff rates
    SELECT
      s1.step_number,
      s1.step_name,
      s1.visitors as visitors,
      round(s1.visitors * 100.0 / first_step.visitors, 2) as conversion_rate,
      CASE 
        WHEN s1.step_number = 1 THEN 0
        ELSE round((1 - (s1.visitors / prev_step.visitors)) * 100.0, 2)
      END as dropoff_rate
    FROM StepCounts s1
    CROSS JOIN (SELECT visitors FROM StepCounts WHERE step_number = 1) as first_step
    LEFT JOIN (
      SELECT step_number + 1 as next_step_number, visitors
      FROM StepCounts
      WHERE step_number < {stepNumber:Int32}
    ) as prev_step ON s1.step_number = prev_step.next_step_number
    ORDER BY s1.step_number
    `;

    // Execute the query
    const result = await clickhouse.query({
      query,
      format: "JSONEachRow",
      query_params: {
        siteId: Number(site),
        stepNumber: steps.length,
      },
    });

    // Process the results
    const data = await processResults<FunnelResponse>(result);
    return reply.send({ data });
  } catch (error) {
    console.error("Error executing funnel query:", error);
    return reply
      .status(500)
      .send({ error: "Failed to execute funnel analysis" });
  }
}
