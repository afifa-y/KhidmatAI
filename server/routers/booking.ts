import { z } from "zod";
import { eq, avg, and, lte } from "drizzle-orm";

/** Strip markdown code fences and extract the first JSON object/array from a string. */
const stripMarkdownJson = (raw: string): string => {
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (cleaned.startsWith("{") || cleaned.startsWith("[")) return cleaned;
  const match = cleaned.match(/([\[{][\s\S]*[\]}])/m);
  return match ? match[1] : cleaned;
};

import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { conversations, bookings, providers, reviews, notifications } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import { geocodeLocation, haversineKm } from "../utils/distance";

// ── Schemas ──────────────────────────────────────────────
const chatInputSchema = z.object({
  message: z.string(),
  sessionId: z.string().optional(),
});

// ── Types ────────────────────────────────────────────────
type ExtractedIntent = {
  service_type?: string;
  task_description?: string;
  location?: string;
  time?: string;
  budget?: string;
  user_name?: string;
  priority_mode?: "budget" | "quality" | "proximity";
  is_complete: boolean;
  follow_up_question?: string;
};

// ── Fuzzy Yes/No Matching ──────────────────────────────────
const YES_WORDS = ["haan", "han", "yes", "yeah", "yep", "ok", "okay", "theek hai", "theek", "confirm", "ho jaye", "bilkul", "ji", "ji haan", "sure", "done", "kardo", "kar do"];
const NO_WORDS = ["nahi", "nah", "no", "nope", "cancel", "band karo", "ruko", "mat karo", "nope", "nhn"];

function matchesAffirmative(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return YES_WORDS.some(w => lower === w || lower.includes(w));
}

function matchesNegative(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return NO_WORDS.some(w => lower === w || lower.includes(w));
}

// ── Helpers ──────────────────────────────────────────────
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15);
}

// Valid service categories for the LLM to normalize to
const VALID_CATEGORIES = ["electrician", "plumber", "ac_technician", "tutor", "beautician", "carpenter", "painter", "cleaner", "other"];

// ── Router ───────────────────────────────────────────────
export const bookingRouter = router({

  /** Unified multi-turn conversation endpoint */
  chat: publicProcedure
    .input(chatInputSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const sessionId = input.sessionId || generateSessionId();
      let conversation: any = null;
      let history: { role: string; content: string }[] = [];
      let stage = "intent_gathering";

      // Fetch existing conversation if exists
      if (input.sessionId) {
        const result = await db.select().from(conversations).where(eq(conversations.sessionId, sessionId)).limit(1);
        if (result.length > 0) {
          conversation = result[0];
          history = (conversation.messages as any[]) || [];
          stage = conversation.stage || "intent_gathering";
        }
      }

      // Add user message to history
      history.push({ role: "user", content: input.message });

      // ── STAGE: AWAITING CONFIRMATION ──────────────────────
      if (stage === "awaiting_confirmation") {
        if (matchesAffirmative(input.message)) {
          // User said YES — create booking
          const intent = conversation.extractedIntent as ExtractedIntent;
          const pendingProviderId = (conversation.userPriority as any)?.pendingProviderId;

          if (!pendingProviderId) {
            const msg = "Something went wrong. Let's start over — tell me what service you need.";
            history.push({ role: "assistant", content: msg });
            await updateConversation(db, conversation, sessionId, history, null, null, "intent_gathering");
            return { sessionId, stage: "intent_gathering", message: msg };
          }

          try {
            const providerResult = await db.select().from(providers).where(eq(providers.id, pendingProviderId)).limit(1);
            if (providerResult.length === 0) throw new Error("Provider not found");
            const provider = providerResult[0];

            const bookingCode = "KH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            const newBooking = await db.insert(bookings).values({
              bookingCode,
              sessionId,
              providerId: provider.id,
              serviceType: intent?.service_type || provider.category,
              taskDescription: intent?.task_description,
              userLocationText: intent?.location,
              scheduledTime: intent?.time || "ASAP",
              status: "confirmed",
            }).returning();

            const confirmMsg = `✅ Booking confirmed!\n\n📋 Code: ${bookingCode}\n👷 Provider: ${provider.name}\n📞 Phone: ${provider.phone}\n📍 Location: ${provider.locationText}\n⏰ Time: ${intent?.time || "ASAP"}\n\nAapka booking ho gaya hai! ${provider.name} aapko jaldi contact karein ge.`;
            history.push({ role: "assistant", content: confirmMsg });
            await updateConversation(db, conversation, sessionId, history, conversation.extractedIntent, conversation.userPriority, "confirmed");

            // ── SAVE AUTOMATED NOTIFICATIONS TO DATABASE ──
            const bookingId = newBooking[0].id;
            const now = new Date();
            
            // Parse targeted service scheduled date (e.g. Kal subah, ASAP, etc.)
            const serviceDate = parseScheduledTime(intent?.time || "ASAP");

            // 1. Confirmed Notification (Immediate)
            await db.insert(notifications).values({
              bookingId,
              type: "CONFIRMATION",
              message: `Aapki booking confirmed hai! 👷 ${provider.name} ke sath at Rs ${provider.hourlyRate}/hr. Cost estimate: ${intent?.budget || "TBD"}.`,
              scheduledAt: now,
              status: "PENDING",
            });

            // 2. Reminder Notification (Forced 10 seconds for demo/testing)
            const reminderTime = new Date(now.getTime() + 10 * 1000);
            await db.insert(notifications).values({
              bookingId,
              type: "REMINDER",
              message: `⏰ Reminder: Aapki service with ${provider.name} ${intent?.time || "ASAP"} par scheduled hai. Please be ready!\n\n[DEMO: This notification was set to fire in 10 seconds for quick testing. In production it fires 1 hour before your service.]`,
              scheduledAt: reminderTime,
              status: "PENDING",
            });

            // 3. Completion & Review Prompt Notification (Forced 20 seconds for demo/testing)
            const completionTime = new Date(now.getTime() + 20 * 1000);
            await db.insert(notifications).values({
              bookingId,
              type: "COMPLETION",
              message: `🌟 Service Complete: Aapki service complete ho chuki hai! Please submit a review for ${provider.name} to help improve KhidmatAI matches.\n\n[DEMO: This notification was set to fire in 20 seconds for quick testing. In production it fires 2 hours after your service.]`,
              scheduledAt: completionTime,
              status: "PENDING",
            });

            // 4. Safety Warning Notification (if applicable)
            const userPriorityObj = conversation.userPriority as any;
            if (userPriorityObj?.isDangerous && userPriorityObj?.safetyWarning) {
              await db.insert(notifications).values({
                bookingId,
                type: "REMINDER",
                message: `⚠️ Safety Warning: ${userPriorityObj.safetyWarning}`,
                scheduledAt: now,
                status: "PENDING",
              });
            }

            return {
              sessionId,
              stage: "confirmed",
              message: confirmMsg,
              booking: newBooking[0],
              provider,
            };
          } catch (err: any) {
            const msg = `Booking create karne mein error aaya: ${err.message}. Dobara try karein.`;
            history.push({ role: "assistant", content: msg });
            await updateConversation(db, conversation, sessionId, history, conversation.extractedIntent, conversation.userPriority, "awaiting_confirmation");
            return { sessionId, stage: "awaiting_confirmation", message: msg };
          }

        } else if (matchesNegative(input.message)) {
          // User said NO — reset to gathering
          const msg = "Koi baat nahi! Kya aap koi aur provider dekhna chahte hain ya naya request dena chahte hain?";
          history.push({ role: "assistant", content: msg });
          await updateConversation(db, conversation, sessionId, history, conversation.extractedIntent, conversation.userPriority, "intent_gathering");
          return { sessionId, stage: "intent_gathering", message: msg };
        } else {
          // ── REFINEMENT REQUEST ───────────────────────────
          // User didn't confirm but also didn't hard-cancel.
          // They want a different/better option. Re-run recommendation
          // with their new constraint, excluding the previously shown provider.
          const intent = conversation.extractedIntent as ExtractedIntent;
          const previousProviderId = (conversation.userPriority as any)?.pendingProviderId;
          const userPriorityData = conversation.userPriority as any;
          const priorityMode = userPriorityData?.mode || intent?.priority_mode || "quality";

          const serviceType = (intent?.service_type || "").toLowerCase();
          if (!intent || !VALID_CATEGORIES.includes(serviceType)) {
            const msg = "Koi baat nahi! Dobara batayein — kaunsi service chahiye?";
            history.push({ role: "assistant", content: msg });
            await updateConversation(db, conversation, sessionId, history, null, null, "intent_gathering");
            return { sessionId, stage: "intent_gathering", message: msg };
          }

          const locationToGeocode = intent.location || "Islamabad";
          const userCoords = await geocodeLocation(locationToGeocode);
          const allProviders = await db.select().from(providers).where(eq(providers.category, serviceType as any));

          const ratingsResult = await db
            .select({ providerId: reviews.providerId, avgRating: avg(reviews.rating) })
            .from(reviews).groupBy(reviews.providerId);
          const ratingsMap = new Map(ratingsResult.map((r: any) => [r.providerId, parseFloat(r.avgRating || "0")]));

          const allReviews = await db.select().from(reviews);
          const reviewsMap = new Map<number, string>();
          for (const rev of allReviews) {
            if (!reviewsMap.has(rev.providerId) && rev.rating >= 4) {
              reviewsMap.set(rev.providerId, `"${rev.comment}" — ${rev.reviewerName}`);
            }
          }

          let enrichedProviders = allProviders.map((p: any) => {
            let distanceKm: number | null = null;
            if (userCoords && p.latitude && p.longitude) {
              distanceKm = haversineKm(userCoords.lat, userCoords.lng, p.latitude, p.longitude);
            }
            return {
              id: p.id, name: p.name, phone: p.phone, specialty: p.specialty,
              locationText: p.locationText, hourlyRate: p.hourlyRate,
              yearsExperience: p.yearsExperience, totalJobsDone: p.totalJobsDone,
              isVerified: p.isVerified, availabilityStatus: p.availabilityStatus,
              distanceKm: distanceKm ? Math.round(distanceKm * 10) / 10 : null,
              avgRating: ratingsMap.get(p.id) || 0,
              topReview: reviewsMap.get(p.id) || null,
            };
          })
          .filter((p: any) => (p.distanceKm === null || p.distanceKm <= 15) && p.id !== previousProviderId)
          .sort((a: any, b: any) => (a.distanceKm || 0) - (b.distanceKm || 0));

          if (enrichedProviders.length === 0) {
            const msg = "Is category mein aur koi provider available nahi hai. Kya aap naya request karna chahte hain?";
            history.push({ role: "assistant", content: msg });
            await updateConversation(db, conversation, sessionId, history, intent, null, "intent_gathering");
            return { sessionId, stage: "intent_gathering", message: msg };
          }

          // Re-rank with the user's new constraint as additional context
          const refinementPrompt = `You are KhidmatAI's matching agent. The user REJECTED the previous recommendation.
They said: "${input.message}"

USER REQUEST: ${intent.task_description}
USER PRIORITY: ${priorityMode.toUpperCase()}
USER'S NEW CONSTRAINT: "${input.message}" — take this into account when choosing.

AVAILABLE PROVIDERS (previous one already excluded):
${JSON.stringify(enrichedProviders.slice(0, 8), null, 1)}

Pick the SINGLE BEST provider that satisfies both the original priority AND the user's new constraint.
Return JSON: { "chosen_provider_id": number, "reasoning": "2-3 sentences explaining why this is better given the user's feedback", "estimated_cost": "Rs X-Y", "is_dangerous_task": boolean, "safety_warning": string }
IMPORTANT: Respond ONLY with raw JSON.`;

          const llmRec = await invokeLLM({
            messages: [{ role: "system", content: refinementPrompt }, { role: "user", content: "Pick the best alternative." }],
          });

          let recommendation: any;
          try {
            recommendation = JSON.parse(stripMarkdownJson(llmRec.choices[0].message.content as string));
          } catch {
            recommendation = { chosen_provider_id: enrichedProviders[0].id, reasoning: "Best alternative match.", estimated_cost: "TBD", is_dangerous_task: false };
          }

          const chosenProvider = enrichedProviders.find((p: any) => p.id === recommendation.chosen_provider_id) || enrichedProviders[0];

          let recMsg = `🔄 **Zaroor! Yeh raha ek aur option:**\n\n`;
          recMsg += `👷 **${chosenProvider.name}**\n`;
          recMsg += `⭐ Rating: ${chosenProvider.avgRating.toFixed(1)}/5 (${chosenProvider.totalJobsDone} jobs)\n`;
          recMsg += `💰 Rate: Rs ${chosenProvider.hourlyRate}/hr\n`;
          recMsg += `📍 ${chosenProvider.locationText}`;
          if (chosenProvider.distanceKm) recMsg += ` (${chosenProvider.distanceKm} km away)`;
          recMsg += `\n🛠️ ${chosenProvider.specialty}\n`;
          if (chosenProvider.topReview) recMsg += `💬 ${chosenProvider.topReview}\n`;
          recMsg += `\n💡 **Why this one:** ${recommendation.reasoning}\n`;
          recMsg += `💰 **Estimated cost:** ${recommendation.estimated_cost}\n`;
          if (recommendation.is_dangerous_task && recommendation.safety_warning) {
            recMsg += `\n⚠️ **Safety:** ${recommendation.safety_warning}\n`;
          }
          recMsg += `\n**Kya aap ${chosenProvider.name} ko confirm karna chahte hain? (Haan / Nahi)**`;

          history.push({ role: "assistant", content: recMsg });
          const newUserPriority = { 
            ...userPriorityData, 
            pendingProviderId: chosenProvider.id,
            isDangerous: recommendation.is_dangerous_task || false,
            safetyWarning: recommendation.safety_warning || null
          };
          await updateConversation(db, conversation, sessionId, history, intent, newUserPriority, "awaiting_confirmation");
          return { sessionId, stage: "awaiting_confirmation", message: recMsg, intent, provider: chosenProvider, recommendation };
        }
      }

      // ── STAGE: INTENT GATHERING ──────────────────────────
      const systemPrompt = `You are KhidmatAI, a friendly assistant matching users with local service providers in Islamabad, Pakistan.
You speak naturally in the SAME language as the user (Urdu/Roman Urdu/English).

Your job: gather the following information through natural conversation.
If multiple fields are missing, present them as bullet points for the user to answer.

Fields to collect:
• user_name — User's name (ask politely: "Aapka naam?")
• service_type — MUST be one of: ${VALID_CATEGORIES.join(", ")}
• task_description — What exactly needs to be done
• location — Area/sector in Islamabad
• time — When (morning, afternoon, evening, ASAP, kal, etc.)
• priority_mode — Ask: "Aap ki priority kya hai?"
  - "budget" = kam se kam paison mein kaam
  - "quality" = best quality kaam chahe mehenga ho
  - "proximity" = fori taur pe / jaldi se jaldi / sabse qareeb worker

When ALL fields are collected, set is_complete to true.
If any are missing, set is_complete to false and write a follow_up_question.

IMPORTANT: Respond ONLY with a raw JSON object. No markdown, no explanation.
Schema: { "user_name": string, "service_type": string, "task_description": string, "location": string, "time": string, "priority_mode": "budget"|"quality"|"proximity", "is_complete": boolean, "follow_up_question": string }`;

      const llmMessages = [
        { role: "system" as const, content: systemPrompt },
        ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
      ];

      const response = await invokeLLM({ messages: llmMessages });

      let intent: ExtractedIntent;
      try {
        const aiText = stripMarkdownJson(response.choices[0].message.content as string);
        intent = JSON.parse(aiText);
      } catch {
        console.warn("[chat] Failed to parse LLM JSON response, using fallback");
        intent = { is_complete: false, follow_up_question: "Apka request samajh nahi aaya. Please dobara batayein — kia service chahiye aur kahan?" };
      }

      // If intent is NOT complete — keep gathering
      if (!intent.is_complete) {
        const msg = intent.follow_up_question || "Thori aur details chahiye. Please batayein kya kaam hai aur kahan?";
        history.push({ role: "assistant", content: msg });
        await updateConversation(db, conversation, sessionId, history, intent, null, "intent_gathering");
        return { sessionId, stage: "intent_gathering", message: msg, intent };
      }

      // ── INTENT COMPLETE — RUN RECOMMENDATION ──────────────
      const serviceType = (intent.service_type || "").toLowerCase();
      if (!VALID_CATEGORIES.includes(serviceType)) {
        const msg = "Sorry, we are unable to find someone capable to complete your requirement at the moment.";
        history.push({ role: "assistant", content: msg });
        await updateConversation(db, conversation, sessionId, history, intent, null, "intent_gathering");
        return { sessionId, stage: "intent_gathering", message: msg };
      }

      // Geocode user location
      const locationToGeocode = intent.location || "Islamabad";
      const userCoords = await geocodeLocation(locationToGeocode);

      // Fetch providers + their avg ratings
      const allProviders = await db.select().from(providers).where(eq(providers.category, serviceType as any));

      if (allProviders.length === 0) {
        const msg = "Sorry, we are unable to find someone capable to complete your requirement at the moment.";
        history.push({ role: "assistant", content: msg });
        await updateConversation(db, conversation, sessionId, history, intent, null, "intent_gathering");
        return { sessionId, stage: "intent_gathering", message: msg };
      }

      // Compute avg ratings from reviews table
      const ratingsResult = await db
        .select({ providerId: reviews.providerId, avgRating: avg(reviews.rating) })
        .from(reviews)
        .groupBy(reviews.providerId);
      const ratingsMap = new Map(ratingsResult.map(r => [r.providerId, parseFloat(r.avgRating || "0")]));

      // Get top review for each provider
      const allReviews = await db.select().from(reviews);
      const reviewsMap = new Map<number, string>();
      for (const rev of allReviews) {
        if (!reviewsMap.has(rev.providerId) && rev.rating >= 4) {
          reviewsMap.set(rev.providerId, `"${rev.comment}" — ${rev.reviewerName}`);
        }
      }

      // Build enriched provider list with distance
      let enrichedProviders = allProviders.map(p => {
        let distanceKm: number | null = null;
        if (userCoords && p.latitude && p.longitude) {
          distanceKm = haversineKm(userCoords.lat, userCoords.lng, p.latitude, p.longitude);
        }
        return {
          id: p.id,
          name: p.name,
          phone: p.phone,
          specialty: p.specialty,
          locationText: p.locationText,
          hourlyRate: p.hourlyRate,
          yearsExperience: p.yearsExperience,
          totalJobsDone: p.totalJobsDone,
          isVerified: p.isVerified,
          availabilityStatus: p.availabilityStatus,
          distanceKm: distanceKm ? Math.round(distanceKm * 10) / 10 : null,
          avgRating: ratingsMap.get(p.id) || 0,
          topReview: reviewsMap.get(p.id) || null,
        };
      });

      // Filter to 15km and sort
      enrichedProviders = enrichedProviders
        .filter(p => p.distanceKm === null || p.distanceKm <= 15)
        .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      if (enrichedProviders.length === 0) {
        const msg = "Sorry, aapke area mein abhi koi provider available nahi hai. Kya aap koi aur area try karna chahein ge?";
        history.push({ role: "assistant", content: msg });
        await updateConversation(db, conversation, sessionId, history, intent, null, "intent_gathering");
        return { sessionId, stage: "intent_gathering", message: msg };
      }

      // LLM Ranking with priority mode
      const priorityMode = intent.priority_mode || "quality";
      const recommendPrompt = `You are KhidmatAI's matching agent. Pick the SINGLE BEST provider for this user.

USER REQUEST: ${intent.task_description}
USER PRIORITY: ${priorityMode.toUpperCase()}
${priorityMode === "budget" ? "→ User wants CHEAPEST option. Heavily weight hourlyRate (lower = better). Ignore expensive providers even if top rated." : ""}
${priorityMode === "quality" ? "→ User wants BEST QUALITY. Heavily weight avgRating, totalJobsDone, yearsExperience, isVerified." : ""}
${priorityMode === "proximity" ? "→ User needs it URGENTLY. Heavily weight distanceKm (lower = better) and availabilityStatus === 'available'." : ""}

PROVIDERS:
${JSON.stringify(enrichedProviders.slice(0, 8), null, 1)}

Return a JSON:
{ "chosen_provider_id": number, "reasoning": "2-3 sentences in the user's language explaining WHY this provider was chosen over others, mentioning specific trade-offs (cost vs rating vs distance)", "estimated_cost": "Rs X-Y range for this job", "is_dangerous_task": boolean, "safety_warning": string }

IMPORTANT: Respond ONLY with raw JSON. No markdown, no explanation.`;

      const llmRec = await invokeLLM({
        messages: [
          { role: "system", content: recommendPrompt },
          { role: "user", content: "Pick the best provider." },
        ],
      });

      let recommendation: any;
      try {
        recommendation = JSON.parse(stripMarkdownJson(llmRec.choices[0].message.content as string));
      } catch {
        console.warn("[recommend] Failed to parse LLM recommendation, using first provider");
        recommendation = { chosen_provider_id: enrichedProviders[0].id, reasoning: "Best available match.", estimated_cost: "TBD", is_dangerous_task: false };
      }

      const chosenProvider = enrichedProviders.find(p => p.id === recommendation.chosen_provider_id) || enrichedProviders[0];

      // Build the recommendation message
      let recMsg = `🎯 **${intent.user_name ? intent.user_name + ", y" : "Y"}eh raha aapka best match:**\n\n`;
      recMsg += `👷 **${chosenProvider.name}**\n`;
      recMsg += `⭐ Rating: ${chosenProvider.avgRating.toFixed(1)}/5 (${chosenProvider.totalJobsDone} jobs)\n`;
      recMsg += `💰 Rate: Rs ${chosenProvider.hourlyRate}/hr\n`;
      recMsg += `📍 ${chosenProvider.locationText}`;
      if (chosenProvider.distanceKm) recMsg += ` (${chosenProvider.distanceKm} km away)`;
      recMsg += `\n🛠️ ${chosenProvider.specialty}\n`;
      if (chosenProvider.topReview) recMsg += `💬 ${chosenProvider.topReview}\n`;
      recMsg += `\n💡 **Why this provider:** ${recommendation.reasoning}\n`;
      recMsg += `💰 **Estimated cost:** ${recommendation.estimated_cost}\n`;
      if (recommendation.is_dangerous_task && recommendation.safety_warning) {
        recMsg += `\n⚠️ **Safety:** ${recommendation.safety_warning}\n`;
      }
      recMsg += `\n**Kya aap ${chosenProvider.name} ko confirm karna chahte hain? (Haan / Nahi)**`;

      history.push({ role: "assistant", content: recMsg });

      // Save with pending provider ID for confirmation
      const userPriority = { 
        mode: priorityMode, 
        name: intent.user_name, 
        pendingProviderId: chosenProvider.id,
        isDangerous: recommendation.is_dangerous_task || false,
        safetyWarning: recommendation.safety_warning || null
      };
      await updateConversation(db, conversation, sessionId, history, intent, userPriority, "awaiting_confirmation");

      return {
        sessionId,
        stage: "awaiting_confirmation",
        message: recMsg,
        intent,
        provider: chosenProvider,
        recommendation,
      };
    }),

  /** Checks for any pending notifications that are scheduled to be sent */
  checkNotifications: publicProcedure
    .input(z.object({ sessionId: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const now = new Date();
      // Select notifications that are PENDING and scheduled at or before now
      const pending = await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.status, "PENDING"),
          lte(notifications.scheduledAt, now)
        ));

      if (pending.length > 0) {
        // Mark as SENT so the same notification isn't delivered twice
        for (const n of pending) {
          await db.update(notifications)
            .set({ status: "SENT", sentAt: now })
            .where(eq(notifications.id, n.id));
        }
        console.log(`[Notifications] Delivered ${pending.length} notification(s)`);
      }

      return { notifications: pending };
    }),

  /** Submits a review and updates the database */
  submitReview: publicProcedure
    .input(z.object({
      bookingId: z.number(),
      providerId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().default(""),
      reviewerName: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const newReview = await db.insert(reviews).values({
        providerId: input.providerId,
        bookingId: input.bookingId,
        reviewerName: input.reviewerName || "Anonymous",
        rating: input.rating,
        comment: input.comment,
      }).returning();

      // Mark the booking as completed
      await db.update(bookings)
        .set({ status: "completed" })
        .where(eq(bookings.id, input.bookingId));

      return { success: true, review: newReview[0] };
    }),
});

// Helper to parse scheduler times
function parseScheduledTime(timeStr: string): Date {
  const now = new Date();
  const lower = timeStr.toLowerCase();
  if (lower.includes("kal") || lower.includes("tomorrow")) {
    now.setDate(now.getDate() + 1);
  }
  if (lower.includes("subah") || lower.includes("morning")) {
    now.setHours(9, 0, 0, 0);
  } else if (lower.includes("shaam") || lower.includes("evening")) {
    now.setHours(17, 0, 0, 0);
  } else if (lower.includes("dopahar") || lower.includes("afternoon")) {
    now.setHours(14, 0, 0, 0);
  } else {
    // ASAP or generic: set to 1 hour from now for testing
    now.setHours(now.getHours() + 1);
  }
  return now;
}

// ── DB Helper ────────────────────────────────────────────
async function updateConversation(
  db: any,
  existing: any,
  sessionId: string,
  messages: any[],
  intent: any,
  userPriority: any,
  stage: string,
) {
  if (existing) {
    await db.update(conversations)
      .set({
        messages: messages as any,
        extractedIntent: intent as any,
        userPriority: userPriority as any,
        stage,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, existing.id));
  } else {
    await db.insert(conversations).values({
      sessionId,
      messages: messages as any,
      extractedIntent: intent as any,
      userPriority: userPriority as any,
      stage,
    });
  }
}
