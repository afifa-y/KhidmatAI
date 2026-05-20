import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

export interface ChatBubbleProps {
  role: "user" | "bot";
  text: string;
}

/** Render text with **bold** support by splitting on ** markers */
function FormattedText({
  text,
  isUser,
}: {
  text: string;
  isUser: boolean;
}) {
  // Split the text into segments: normal and **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <Text
      className={cn(
        "text-[15px] leading-[22px]",
        isUser ? "text-white" : "text-foreground"
      )}
    >
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={i} style={{ fontWeight: "700" }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export function ChatBubble({ role, text }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <View
      className={cn(
        "mb-2 flex-row items-end gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <View
          className="mb-1 h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: "#0a7ea4" }}
        >
          <Text style={{ fontSize: 14 }}>🤖</Text>
        </View>
      )}

      {/* Bubble */}
      <View
        className={cn(
          "rounded-2xl px-4 py-3",
          isUser
            ? "rounded-br-sm"
            : "rounded-bl-sm bg-surface border border-border/50"
        )}
        style={
          isUser
            ? {
                backgroundColor: "#0a7ea4",
                maxWidth: "78%",
                shadowColor: "#0a7ea4",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }
            : {
                maxWidth: "78%",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }
        }
      >
        <FormattedText text={text} isUser={isUser} />
      </View>

      {/* User Avatar */}
      {isUser && (
        <View className="mb-1 h-8 w-8 items-center justify-center rounded-full bg-surface border border-border">
          <Text style={{ fontSize: 14 }}>👤</Text>
        </View>
      )}
    </View>
  );
}
