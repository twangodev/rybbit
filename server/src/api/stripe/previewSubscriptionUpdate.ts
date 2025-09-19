import { FastifyReply, FastifyRequest } from "fastify";
import { stripe } from "../../lib/stripe.js";
import { db } from "../../db/postgres/postgres.js";
import { organization, member } from "../../db/postgres/schema.js";
import { eq, and } from "drizzle-orm";
import Stripe from "stripe";

interface PreviewSubscriptionBody {
  organizationId: string;
  newPriceId: string;
}

export async function previewSubscriptionUpdate(
  request: FastifyRequest<{ Body: PreviewSubscriptionBody }>,
  reply: FastifyReply
) {
  const { organizationId, newPriceId } = request.body;
  const userId = request.user?.id;

  if (!userId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  if (!organizationId || !newPriceId) {
    return reply.status(400).send({
      error: "Missing required parameters: organizationId, newPriceId",
    });
  }

  try {
    // 1. Verify user has permission to manage billing for this organization
    const memberResult = await db
      .select({
        role: member.role,
      })
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)))
      .limit(1);

    if (!memberResult.length || memberResult[0].role !== "owner") {
      return reply.status(403).send({
        error: "Only organization owners can manage billing",
      });
    }

    // 2. Find the organization and its Stripe customer ID
    const orgResult = await db
      .select({
        stripeCustomerId: organization.stripeCustomerId,
      })
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

    const org = orgResult[0];

    if (!org || !org.stripeCustomerId) {
      return reply.status(404).send({ error: "Organization or Stripe customer ID not found" });
    }

    // 3. Get the active subscription
    const subscriptions = await (stripe as Stripe).subscriptions.list({
      customer: org.stripeCustomerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return reply.status(404).send({ error: "No active subscription found" });
    }

    const subscription = subscriptions.data[0];
    const currentItem = subscription.items.data[0];
    const currentPeriodEnd = (currentItem as any).current_period_end;

    // 4. Get price details for both current and new prices
    const [currentPrice, newPrice] = await Promise.all([
      (stripe as Stripe).prices.retrieve(currentItem.price.id),
      (stripe as Stripe).prices.retrieve(newPriceId),
    ]);

    // 5. Create a preview of the upcoming invoice with proration
    const upcomingInvoice = await (stripe as Stripe).invoices.createPreview({
      customer: org.stripeCustomerId,
      subscription: subscription.id,
      subscription_details: {
        items: [
          {
            id: currentItem.id,
            price: newPriceId,
          },
        ],
        proration_behavior: "always_invoice",
      },
    });

    // 6. Calculate proration details
    const prorationItems = upcomingInvoice.lines.data.filter((item: any) => item.proration);

    let proratedCredit = 0;
    let proratedCharge = 0;

    prorationItems.forEach((item: any) => {
      if (item.amount < 0) {
        proratedCredit += Math.abs(item.amount);
      } else {
        proratedCharge += item.amount;
      }
    });

    const immediateCharge = (upcomingInvoice as any).amount_due;

    // Debug logging
    console.log("Preview Debug:", {
      currentPrice: currentPrice.unit_amount,
      newPrice: newPrice.unit_amount,
      proratedCredit,
      proratedCharge,
      immediateCharge,
      totalLines: upcomingInvoice.lines.data.length,
      lines: upcomingInvoice.lines.data.map((line: any) => ({
        description: line.description,
        amount: line.amount,
        proration: line.proration,
      })),
    });

    // 7. Return preview information
    return reply.send({
      success: true,
      preview: {
        currentPlan: {
          priceId: currentItem.price.id,
          amount: currentPrice.unit_amount || 0,
          interval: currentPrice.recurring?.interval || "month",
        },
        newPlan: {
          priceId: newPriceId,
          amount: newPrice.unit_amount || 0,
          interval: newPrice.recurring?.interval || "month",
        },
        proration: {
          credit: proratedCredit / 100, // Convert from cents to dollars
          charge: proratedCharge / 100,
          immediatePayment: immediateCharge / 100,
          nextBillingDate: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
        },
        // Add a human-readable summary
        summary: {
          isUpgrade: (newPrice.unit_amount || 0) > (currentPrice.unit_amount || 0),
          immediatePaymentRequired: immediateCharge > 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Subscription Preview Error:", error);
    return reply.status(500).send({
      error: "Failed to preview subscription update",
      details: error.message,
    });
  }
}
