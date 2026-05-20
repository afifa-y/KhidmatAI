/**
 * Booking API Service — Simplified single-endpoint conversation client
 */
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";

const trpcVanilla = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getApiBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});

// Types
export interface Provider {
  id: number;
  name: string;
  phone: string;
  category?: string;
  specialty: string;
  locationText?: string;
  hourlyRate: number;
  avgRating?: number;
  avatarUrl?: string;
  aiReasoning?: string;
  distanceKm?: number | null;
  topReview?: string | null;
  totalJobsDone?: number;
  yearsExperience?: number;
  isVerified?: boolean;
}

export interface ChatResponse {
  sessionId: string;
  stage: string;
  message: string;
  intent?: any;
  provider?: Provider;
  recommendation?: {
    chosen_provider_id: number;
    reasoning: string;
    estimated_cost: string;
    is_dangerous_task: boolean;
    safety_warning?: string;
  };
  booking?: any;
}

/**
 * Send a message to the KhidmatAI conversation.
 * This is the ONLY function the UI needs to call.
 * The backend handles all stage transitions internally.
 */
export async function sendMessage(
  message: string,
  sessionId?: string,
): Promise<ChatResponse> {
  try {
    const result = await trpcVanilla.booking.chat.mutate({
      message,
      sessionId,
    });
    return result as ChatResponse;
  } catch (error: any) {
    console.error("Chat error:", error);
    return {
      sessionId: sessionId || "",
      stage: "error",
      message: `Error: ${error.message || "Something went wrong. Please try again."}`,
    };
  }
}

export interface DBNotification {
  id: number;
  bookingId: number;
  type: "CONFIRMATION" | "REMINDER" | "COMPLETION";
  message: string;
  scheduledAt: string;
  status: "PENDING" | "SENT" | "FAILED";
  sentAt?: string | null;
}

/** Check if there are any new scheduled notifications ready to be delivered to the client */
export async function checkNotifications(sessionId?: string): Promise<DBNotification[]> {
  try {
    const result = await trpcVanilla.booking.checkNotifications.mutate({ sessionId });
    return (result.notifications || []) as any[];
  } catch (error) {
    console.error("Check notifications error:", error);
    return [];
  }
}

/** Submit provider review and complete booking */
export async function submitReview(params: {
  bookingId: number;
  providerId: number;
  rating: number;
  comment: string;
  reviewerName?: string;
}): Promise<boolean> {
  try {
    const result = await trpcVanilla.booking.submitReview.mutate(params);
    return !!result.success;
  } catch (error) {
    console.error("Submit review error:", error);
    return false;
  }
}
