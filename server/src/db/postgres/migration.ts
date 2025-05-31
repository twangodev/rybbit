import crypto from "crypto";
import { db } from "./postgres.js";
import { user, organization, member, sites } from "./schema.js";
import { eq, and, isNotNull, isNull } from "drizzle-orm";

export async function migrateUserSubscriptionsToOrganizations() {
  console.log(
    "🚀 Starting migration: User subscriptions → Organization subscriptions"
  );

  try {
    // Step 1: Find all users with Stripe customer IDs
    const subscribedUsers = await db
      .select({
        userId: user.id,
        email: user.email,
        stripeCustomerId: user.stripeCustomerId,
        monthlyEventCount: user.monthlyEventCount,
        overMonthlyLimit: user.overMonthlyLimit,
      })
      .from(user)
      .where(isNotNull(user.stripeCustomerId));

    console.log(
      `📊 Found ${subscribedUsers.length} users with Stripe subscriptions`
    );

    if (subscribedUsers.length === 0) {
      console.log("✅ No subscriptions to migrate");
      return;
    }

    // Step 2: For each subscribed user, find their owned organizations
    let migratedCount = 0;
    let skippedCount = 0;

    for (const subscribedUser of subscribedUsers) {
      console.log(
        `\n👤 Processing user: ${subscribedUser.email} (${subscribedUser.stripeCustomerId})`
      );

      // Find organizations where this user is an owner
      const ownedOrganizations = await db
        .select({
          organizationId: member.organizationId,
          organizationName: organization.name,
          organizationSlug: organization.slug,
          currentStripeCustomerId: organization.stripeCustomerId,
        })
        .from(member)
        .innerJoin(organization, eq(organization.id, member.organizationId))
        .where(
          and(
            eq(member.userId, subscribedUser.userId),
            eq(member.role, "owner")
          )
        );

      if (ownedOrganizations.length === 0) {
        console.log(
          `  ⚠️  User has subscription but owns no organizations - skipping`
        );
        skippedCount++;
        continue;
      }

      if (ownedOrganizations.length > 1) {
        console.log(
          `  ⚠️  User owns ${ownedOrganizations.length} organizations - migrating to first one only`
        );
      }

      const targetOrg = ownedOrganizations[0];

      // Check if organization already has a Stripe customer ID
      if (targetOrg.currentStripeCustomerId) {
        console.log(
          `  ⚠️  Organization "${targetOrg.organizationName}" already has Stripe customer ID: ${targetOrg.currentStripeCustomerId} - skipping`
        );
        skippedCount++;
        continue;
      }

      // Step 3: Migrate billing data to organization
      await db
        .update(organization)
        .set({
          stripeCustomerId: subscribedUser.stripeCustomerId,
          monthlyEventCount: subscribedUser.monthlyEventCount || 0,
          overMonthlyLimit: subscribedUser.overMonthlyLimit || false,
        })
        .where(eq(organization.id, targetOrg.organizationId));

      console.log(
        `  ✅ Migrated subscription to organization: "${targetOrg.organizationName}" (${targetOrg.organizationSlug})`
      );
      console.log(
        `     - Stripe Customer ID: ${subscribedUser.stripeCustomerId}`
      );
      console.log(
        `     - Monthly Event Count: ${subscribedUser.monthlyEventCount || 0}`
      );
      console.log(
        `     - Over Monthly Limit: ${subscribedUser.overMonthlyLimit || false}`
      );

      migratedCount++;
    }

    // Step 4: Clear user billing data (optional - uncomment if you want to clean up immediately)
    /*
    console.log("\n🧹 Clearing user billing data...");
    await db
      .update(user)
      .set({
        stripeCustomerId: null,
        monthlyEventCount: 0,
        overMonthlyLimit: false,
      })
      .where(isNotNull(user.stripeCustomerId));
    */

    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${migratedCount} subscriptions`);
    console.log(`   ⚠️  Skipped: ${skippedCount} subscriptions`);
    console.log(`\n🎉 Migration completed successfully!`);

    // Step 5: Verification query
    console.log("\n🔍 Verification - Organizations with billing:");
    const orgBilling = await db
      .select({
        organizationId: organization.id,
        organizationName: organization.name,
        stripeCustomerId: organization.stripeCustomerId,
        monthlyEventCount: organization.monthlyEventCount,
        overMonthlyLimit: organization.overMonthlyLimit,
      })
      .from(organization)
      .where(isNotNull(organization.stripeCustomerId));

    orgBilling.forEach((org) => {
      console.log(
        `   📋 ${org.organizationName}: ${org.stripeCustomerId} (${org.monthlyEventCount} events)`
      );
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Optional: Add a rollback function in case you need to undo the migration
export async function rollbackOrganizationSubscriptions() {
  console.log("🔄 Rolling back organization subscriptions to users...");

  try {
    // Find organizations with billing data
    const orgsWithBilling = await db
      .select({
        organizationId: organization.id,
        organizationName: organization.name,
        stripeCustomerId: organization.stripeCustomerId,
        monthlyEventCount: organization.monthlyEventCount,
        overMonthlyLimit: organization.overMonthlyLimit,
      })
      .from(organization)
      .where(isNotNull(organization.stripeCustomerId));

    for (const org of orgsWithBilling) {
      // Find the owner of this organization
      const owner = await db
        .select({
          userId: member.userId,
          userEmail: user.email,
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(
          and(
            eq(member.organizationId, org.organizationId),
            eq(member.role, "owner")
          )
        )
        .limit(1);

      if (owner.length > 0) {
        // Move billing back to user
        await db
          .update(user)
          .set({
            stripeCustomerId: org.stripeCustomerId,
            monthlyEventCount: org.monthlyEventCount || 0,
            overMonthlyLimit: org.overMonthlyLimit || false,
          })
          .where(eq(user.id, owner[0].userId));

        // Clear organization billing
        await db
          .update(organization)
          .set({
            stripeCustomerId: null,
            monthlyEventCount: 0,
            overMonthlyLimit: false,
          })
          .where(eq(organization.id, org.organizationId));

        console.log(
          `✅ Rolled back ${org.organizationName} billing to user ${owner[0].userEmail}`
        );
      }
    }

    console.log("🎉 Rollback completed successfully!");
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    throw error;
  }
}

export async function backfillKeys() {
  console.log("Starting API key backfill process...");

  try {
    // 1. Find all sites that do not have an API key yet
    const sitesToUpdate = await db
      .select({ siteId: sites.siteId })
      .from(sites)
      .where(isNull(sites.apiKey));

    if (sitesToUpdate.length === 0) {
      console.log("All sites already have an API key. No action needed.");
      return;
    }

    console.log(`Found ${sitesToUpdate.length} site(s) needing an API key.`);

    // 2. Generate and update keys for each site
    const updatePromises = sitesToUpdate.map(async (site) => {
      const newApiKey = crypto.randomBytes(32).toString("hex");
      console.log(`Generating key for siteId: ${site.siteId}...`);
      await db
        .update(sites)
        .set({ apiKey: newApiKey })
        .where(eq(sites.siteId, site.siteId));
    });

    await Promise.all(updatePromises);

    console.log(`Successfully generated and stored API keys for ${sitesToUpdate.length} site(s).`);
  } catch (error) {
    console.error("An error occurred during the backfill process:", error);
  } finally {
    // If your DB connection doesn"t automatically close, you might need to end it here.
    // For example: await db.end();
    console.log("Backfill process finished.");
  }
}
