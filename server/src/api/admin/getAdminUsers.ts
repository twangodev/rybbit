import { eq, inArray } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { member, sites, user } from "../../db/postgres/schema.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";

export async function getAdminUsers(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const session = await getSessionFromReq(request);

  const userRecord = await db
    .select({ godMode: user.godMode })
    .from(user)
    .where(eq(user.id, session?.user.id ?? ""))
    .limit(1);

  if (!userRecord || !userRecord[0].godMode) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  // Get all organization owners
  const orgOwners = await db
    .select({
      userId: member.userId,
      organizationId: member.organizationId,
    })
    .from(member)
    .where(eq(member.role, "owner"));

  // Create a map of user IDs to their owned organization IDs
  const userOrgMap = new Map<string, string[]>();
  for (const owner of orgOwners) {
    if (!userOrgMap.has(owner.userId)) {
      userOrgMap.set(owner.userId, []);
    }
    userOrgMap.get(owner.userId)?.push(owner.organizationId);
  }

  // Get all user details for organization owners
  const allOrgOwnerIds = [...userOrgMap.keys()];
  const ownerUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      monthlyEventCount: user.monthlyEventCount,
    })
    .from(user)
    .where(
      allOrgOwnerIds.length > 0 ? inArray(user.id, allOrgOwnerIds) : undefined
    );

  // Get all sites belonging to the organizations
  const allOrgIds = [
    ...new Set(orgOwners.map((owner) => owner.organizationId)),
  ];
  const orgSites = await db
    .select({
      siteId: sites.siteId,
      name: sites.name,
      domain: sites.domain,
      createdAt: sites.createdAt,
      organizationId: sites.organizationId,
    })
    .from(sites)
    .where(
      allOrgIds.length > 0
        ? inArray(sites.organizationId, allOrgIds)
        : undefined
    );

  // Create a map of organization IDs to their sites
  const orgSitesMap = new Map<string, any[]>();
  for (const site of orgSites) {
    if (site.organizationId) {
      if (!orgSitesMap.has(site.organizationId)) {
        orgSitesMap.set(site.organizationId, []);
      }
      orgSitesMap.get(site.organizationId)?.push({
        siteId: site.siteId,
        name: site.name,
        domain: site.domain,
        createdAt: site.createdAt,
      });
    }
  }

  // Combine user data with their organizations' sites
  const enrichedUsers = ownerUsers.map((user) => {
    const userOrgIds = userOrgMap.get(user.id) || [];
    const userSites = userOrgIds.flatMap(
      (orgId) => orgSitesMap.get(orgId) || []
    );

    return {
      ...user,
      sites: userSites,
    };
  });

  // Sort by monthlyEventCount in descending order
  enrichedUsers.sort(
    (a, b) => (b.monthlyEventCount || 0) - (a.monthlyEventCount || 0)
  );

  return reply.status(200).send(enrichedUsers);
}
