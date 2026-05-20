import { ScrollView, Text, View, Pressable, Switch, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cn } from "@/lib/utils";

type Language = "en" | "ur" | "roman_ur";

export default function SettingsScreen() {
  const [language, setLanguage] = useState<Language>("en");
  const [useMock, setUseMock] = useState(true);
  const [backendUrl, setBackendUrl] = useState("http://localhost:8000");
  const [saved, setSaved] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const lang = (await AsyncStorage.getItem("language")) as Language | null;
      const mock = await AsyncStorage.getItem("useMock");
      const url = await AsyncStorage.getItem("backendUrl");

      if (lang) setLanguage(lang);
      if (mock !== null) setUseMock(mock === "true");
      if (url) setBackendUrl(url);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem("language", language);
      await AsyncStorage.setItem("useMock", useMock.toString());
      await AsyncStorage.setItem("backendUrl", backendUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const languages: { value: Language; label: string; description: string }[] = [
    { value: "en", label: "English", description: "English language" },
    { value: "ur", label: "اردو", description: "Urdu (native script)" },
    { value: "roman_ur", label: "Roman Urdu", description: "Urdu in Latin script" },
  ];

  return (
    <ScreenContainer className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="p-4"
      >
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
            <Text className="mt-1 text-sm text-muted">Configure your preferences</Text>
          </View>

          {/* Language Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Language</Text>
            <View className="gap-2">
              {languages.map((lang) => (
                <Pressable
                  key={lang.value}
                  onPress={() => setLanguage(lang.value)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View
                    className={cn(
                      "flex-row items-center gap-3 rounded-lg border p-3",
                      language === lang.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface"
                    )}
                  >
                    <View
                      className={cn(
                        "h-5 w-5 rounded-full border-2",
                        language === lang.value
                          ? "border-primary bg-primary"
                          : "border-border"
                      )}
                    />
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{lang.label}</Text>
                      <Text className="text-xs text-muted">{lang.description}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Backend Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Backend</Text>

            {/* Mock mode toggle */}
            <View className="flex-row items-center justify-between rounded-lg border border-border bg-surface p-4">
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Use Mock Data</Text>
                <Text className="text-xs text-muted">
                  {useMock
                    ? "Using local mock providers (no network required)"
                    : "Using live backend API"}
                </Text>
              </View>
              <Switch
                value={useMock}
                onValueChange={setUseMock}
                trackColor={{ false: "#E5E7EB", true: "#0a7ea4" }}
              />
            </View>

            {/* Backend URL input */}
            {!useMock && (
              <View className="gap-2">
                <Text className="text-sm font-medium text-foreground">Backend URL</Text>
                <TextInput
                  value={backendUrl}
                  onChangeText={setBackendUrl}
                  placeholder="http://localhost:8000"
                  placeholderTextColor="#9BA1A6"
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted">
                  Enter your backend server URL (e.g., http://192.168.1.100:8000)
                </Text>
              </View>
            )}
          </View>

          {/* About Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">About</Text>
            <View className="gap-2 rounded-lg border border-border bg-surface p-4">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">App Version</Text>
                <Text className="font-semibold text-foreground">1.0.0</Text>
              </View>
              <View className="mt-2 flex-row justify-between">
                <Text className="text-sm text-muted">Build</Text>
                <Text className="font-semibold text-foreground">Hackathon 2025</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={saveSettings}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View className="rounded-lg bg-primary p-4">
              <Text className="text-center font-semibold text-background">
                {saved ? "✓ Settings Saved" : "Save Settings"}
              </Text>
            </View>
          </Pressable>

          {/* Spacer */}
          <View className="h-4" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
