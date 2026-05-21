import { View, TextInput, Pressable, Text, ScrollView } from "react-native";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface InputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const QUICK_CHIPS = [
  { label: "🌀 AC Tech", value: "AC technician" },
  { label: "🔧 Plumber", value: "Plumber" },
  { label: "⚡ Electric", value: "Electrician" },
  { label: "📚 Tutor", value: "Tutor" },
  { label: "💅 Beauty", value: "Beautician" },
];

export function InputBar({ onSend, disabled = false }: InputBarProps) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleChip = (chip: string) => {
    const location = "G-13";
    const time = "kal subah";
    const message = `${chip} ${location} ${time}`;
    onSend(message);
    setText("");
  };

  const canSend = !disabled && text.trim().length > 0;

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.08)",
        backgroundColor: "#151718",
        paddingTop: 8,
        paddingBottom: 12,
        paddingHorizontal: 12,
      }}
    >
      {/* Quick action chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 8 }}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 2 }}
      >
        {QUICK_CHIPS.map((chip) => (
          <Pressable
            key={chip.value}
            onPress={() => handleChip(chip.value)}
            disabled={disabled}
            style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1 }]}
          >
            <View
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(10,126,164,0.5)",
                backgroundColor: "rgba(10,126,164,0.12)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#0a7ea4",
                  letterSpacing: 0.2,
                }}
              >
                {chip.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Input row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        {/* Text input */}
        <View
          style={{
            flex: 1,
            borderRadius: 22,
            borderWidth: 1.5,
            borderColor: focused ? "#0a7ea4" : "rgba(255,255,255,0.1)",
            backgroundColor: "#1e2022",
            paddingHorizontal: 16,
            paddingVertical: 10,
            minHeight: 44,
            maxHeight: 120,
            shadowColor: focused ? "#0a7ea4" : "transparent",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: focused ? 0.25 : 0,
            shadowRadius: 6,
            elevation: focused ? 4 : 0,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a service request..."
            placeholderTextColor="#555b61"
            editable={!disabled}
            multiline
            maxLength={500}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1,
              color: "#ECEDEE",
              fontSize: 15,
              lineHeight: 22,
              padding: 0,
              maxHeight: 100,
              opacity: disabled ? 0.5 : 1,
            }}
          />
        </View>

        {/* Send button */}
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: canSend ? "#0a7ea4" : "#1e2022",
              borderWidth: 1.5,
              borderColor: canSend ? "#0a7ea4" : "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: canSend ? "#0a7ea4" : "transparent",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: canSend ? 0.4 : 0,
              shadowRadius: 8,
              elevation: canSend ? 5 : 0,
            }}
          >
            <Text style={{ fontSize: 18, lineHeight: 22 }}>
              {canSend ? "➤" : "✎"}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
