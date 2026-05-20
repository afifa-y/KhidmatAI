import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface ThinkingStep {
  agent: string;
  status: "pending" | "active" | "done" | "failed";
  label: string;
}

export interface ThinkingBubbleProps {
  steps: ThinkingStep[];
}

const AGENT_EMOJIS: Record<string, string> = {
  IntentAgent: "🧠",
  DiscoveryAgent: "🔍",
  MatchingAgent: "⭐",
  BookingAgent: "✅",
  FollowUpAgent: "📢",
};

export function ThinkingBubble({ steps }: ThinkingBubbleProps) {
  const [pulse, setPulse] = useState(true);
  const allDone = steps.every((s) => s.status === "done" || s.status === "failed");

  useEffect(() => {
    if (allDone) {
      setPulse(false);
      return;
    }

    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 600);

    return () => clearInterval(interval);
  }, [allDone]);

  return (
    <View className="mb-3 flex-row justify-start">
      <View
        className={cn(
          "rounded-2xl rounded-bl-none bg-surface px-4 py-3",
          allDone && "border border-success"
        )}
      >
        {/* Header */}
        <Text className="mb-2 text-sm font-semibold text-foreground">
          {allDone ? "✓ Done" : "Thinking..."}
        </Text>

        {/* Steps */}
        <View className="gap-2">
          {steps.map((step, index) => {
            const emoji = AGENT_EMOJIS[step.agent] || "⚙️";
            const isDone = step.status === "done";
            const isFailed = step.status === "failed";
            const isActive = step.status === "active";

            return (
              <View
                key={index}
                className={cn(
                  "flex-row items-center gap-2 rounded-lg px-2 py-1",
                  isActive && "bg-primary/10",
                  isDone && "opacity-70",
                  isFailed && "opacity-50"
                )}
              >
                {/* Emoji */}
                <Text className="text-base">{emoji}</Text>

                {/* Status indicator */}
                <View
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isDone && "bg-success",
                    isActive && pulse && "bg-primary opacity-100",
                    isActive && !pulse && "bg-primary opacity-40",
                    isFailed && "bg-error",
                    !isDone && !isActive && !isFailed && "bg-muted"
                  )}
                />

                {/* Label */}
                <Text
                  className={cn(
                    "flex-1 text-xs font-medium",
                    isActive ? "text-foreground" : "text-muted"
                  )}
                >
                  {step.label}
                </Text>

                {/* Status text */}
                {isDone && <Text className="text-xs text-success">✓</Text>}
                {isFailed && <Text className="text-xs text-error">✕</Text>}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
