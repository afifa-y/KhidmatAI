import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { Provider } from "@/lib/services/booking-api";

export interface ProviderCardProps {
  provider: Provider & { _ranking?: number };
  onSelect: (provider: Provider) => void;
}

export function ProviderCard({ provider, onSelect }: ProviderCardProps) {
  const rating = Math.floor(provider.rating || 5);
  const isBest = provider._ranking === 1;
  const distance = provider.distanceKm !== undefined ? Math.round(provider.distanceKm * 10) / 10 : null;

  return (
    <Pressable
      onPress={() => onSelect(provider)}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        className={cn(
          "mb-3 rounded-2xl border p-4",
          isBest ? "border-success bg-success/5" : "border-border bg-surface"
        )}
      >
        {/* Header with ranking badge */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">{provider.name}</Text>
            {isBest && (
              <Text className="mt-1 text-xs font-semibold text-success">✓ Best Match</Text>
            )}
          </View>
          {distance !== null && (
            <View className="items-center rounded-full bg-primary/10 px-3 py-1">
              <Text className="text-sm font-bold text-primary">{distance} km away</Text>
            </View>
          )}
        </View>

        {/* Rating and location */}
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            {Array.from({ length: rating }).map((_, i) => (
              <Text key={i} className="text-lg">
                ⭐
              </Text>
            ))}
            <Text className="ml-1 text-xs text-muted">({provider.rating || 5}/5)</Text>
          </View>
          <Text className="text-sm font-medium text-foreground">{provider.locationText || "Islamabad"}</Text>
        </View>

        {/* Specialty and phone */}
        <View className="gap-2">
          {provider.specialty && (
            <View className="flex-row items-start gap-2 pr-4">
              <Text className="text-sm text-muted">🛠️</Text>
              <Text className="text-sm text-foreground flex-1">{provider.specialty}</Text>
            </View>
          )}
          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-muted">📞</Text>
            <Text className="text-sm text-foreground">{provider.phone}</Text>
          </View>
        </View>
        
        {/* AI Reasoning */}
        {provider.aiReasoning && (
          <View className="mt-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 p-2 border border-indigo-100 dark:border-indigo-800/30">
            <Text className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
              🤖 KhidmatAI says:
            </Text>
            <Text className="text-xs text-indigo-900/80 dark:text-indigo-200/80 mt-1">
              {provider.aiReasoning}
            </Text>
          </View>
        )}

        {/* Tap to select hint */}
        <View className="mt-3 rounded-lg bg-primary/5 px-2 py-1">
          <Text className="text-center text-xs font-medium text-primary">Tap to confirm</Text>
        </View>
      </View>
    </Pressable>
  );
}
