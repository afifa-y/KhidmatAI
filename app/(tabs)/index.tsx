import { FlatList, View, ActivityIndicator, Text, Modal, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { ChatBubble } from "@/components/chat-bubble";
import { InputBar } from "@/components/input-bar";
import { sendMessage, checkNotifications, submitReview, ChatResponse, DBNotification } from "@/lib/services/booking-api";
import { useColors } from "@/hooks/use-colors";

interface Message {
  id: string;
  role: "user" | "bot" | "system_notif";
  text: string;
}

export default function ChatScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const flatListRef = useRef<FlatList>(null);

  // Active review target
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null);
  const [reviewProviderId, setReviewProviderId] = useState<number | null>(null);
  const [reviewProviderName, setReviewProviderName] = useState<string>("Provider");
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>("");

  // In-app alert banner
  const [bannerNotif, setBannerNotif] = useState<DBNotification | null>(null);

  // Dynamic Thinking Steps
  const [activeThinkingIndex, setActiveThinkingIndex] = useState(-1);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([
    "AI analyzing user request...",
    "AI finding best match...",
    "AI checking requirements..."
  ]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Thinking steps rotation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading && activeThinkingIndex >= 0 && activeThinkingIndex < 2) {
      timer = setTimeout(() => {
        setActiveThinkingIndex((prev) => prev + 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [loading, activeThinkingIndex]);

  // Background polling for scheduled database notifications
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!sessionId) return;
      try {
        const newNotifs = await checkNotifications(sessionId);
        if (newNotifs && newNotifs.length > 0) {
          for (const notif of newNotifs) {
            if (notif.type === "COMPLETION") {
              // Open beautiful review modal!
              // For simulation, let's extract provider info or guess it from context.
              // We'll set the booking ID and open modal
              setReviewBookingId(notif.bookingId);
              // In our DB, we can find provider from booking or use a default fallback
              setReviewProviderId(1); // Default placeholder, will be resolved by DB insert
              setReviewProviderName("KhidmatAI Partner");
              setUserRating(5);
              setUserComment("");
              setReviewModalVisible(true);
            } else {
              // Slide in a beautiful notification banner
              setBannerNotif(notif);
              // Also add to chat screen as a system bubble
              setMessages((prev) => [
                ...prev,
                {
                  id: `notif-${Date.now()}-${notif.id}`,
                  role: "system_notif",
                  text: notif.message,
                },
              ]);
              // Clear banner after 5 seconds
              setTimeout(() => {
                setBannerNotif(null);
              }, 5000);
            }
          }
        }
      } catch (err) {
        console.error("Failed to check notifications:", err);
      }
    }, 4000); // Poll every 4 seconds for instant testing feedback

    return () => clearInterval(interval);
  }, [sessionId]);

  const handleSend = async (userText: string) => {
    if (!userText.trim() || loading) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: userText },
    ]);

    // ── Determine Dynamic Thinking Steps ──
    const lower = userText.toLowerCase();
    let serviceName = "best match";
    if (lower.includes("tutor") || lower.includes("teacher") || lower.includes("padhai")) serviceName = "math tutor";
    else if (lower.includes("plumber") || lower.includes("nal")) serviceName = "plumbing specialist";
    else if (lower.includes("electrician") || lower.includes("bijli")) serviceName = "certified electrician";
    else if (lower.includes("ac") || lower.includes("fridge")) serviceName = "AC technician";
    else if (lower.includes("beautician") || lower.includes("makeup")) serviceName = "professional beautician";
    else if (lower.includes("cleaner") || lower.includes("safai")) serviceName = "home cleaning crew";
    else if (lower.includes("painter") || lower.includes("rang")) serviceName = "expert painter";
    else if (lower.includes("carpenter") || lower.includes("lakri")) serviceName = "professional carpenter";

    let priorityName = "overall";
    if (lower.includes("budget") || lower.includes("sasta") || lower.includes("cheap") || lower.includes("kam")) {
      priorityName = "budget";
    } else if (lower.includes("quality") || lower.includes("best") || lower.includes("vip") || lower.includes("mehenga")) {
      priorityName = "quality";
    } else if (lower.includes("fori") || lower.includes("jaldi") || lower.includes("asap") || lower.includes("urgent") || lower.includes("qareeb")) {
      priorityName = "proximity/urgency";
    }

    setThinkingSteps([
      "AI analyzing user request...",
      `AI finding ${serviceName}...`,
      `AI checking ${priorityName} requirements...`
    ]);
    setActiveThinkingIndex(0);
    setLoading(true);

    try {
      const response: ChatResponse = await sendMessage(userText, sessionId);

      // Persist sessionId for conversation continuity
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "bot",
          text: response.message,
        },
      ]);

      // If booking was returned, save info to associate review
      if (response.booking && response.provider) {
        setReviewBookingId(response.booking.id);
        setReviewProviderId(response.provider.id);
        setReviewProviderName(response.provider.name);
      }
    } catch (error: any) {
      console.error("Send error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "bot",
          text: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setActiveThinkingIndex(-1);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewBookingId || !reviewProviderId) return;

    try {
      const success = await submitReview({
        bookingId: reviewBookingId,
        providerId: reviewProviderId,
        rating: userRating,
        comment: userComment,
        reviewerName: "Customer",
      });

      if (success) {
        setReviewModalVisible(false);
        Alert.alert("🎉 Thank You!", "Aapki review successfully save ho chuki hai and rating update ho gayi!");
        
        // Add thank you bot message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: "bot",
            text: `💚 Thank you for your feedback! Aapne ${reviewProviderName} ko ${userRating}⭐ rating di hai. It helps us match the best providers for everyone.`,
          },
        ]);
      } else {
        Alert.alert("Error", "Review save karne mein error aaya. Please retry.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit review.");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === "system_notif") {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center",
            backgroundColor: "rgba(10,126,164,0.12)",
            borderWidth: 1,
            borderColor: "rgba(10,126,164,0.3)",
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginVertical: 6,
            marginHorizontal: 24,
            gap: 8,
            maxWidth: "88%",
          }}
        >
          <Text style={{ fontSize: 16 }}>🔔</Text>
          <Text style={{ color: "#ECEDEE", fontSize: 13, flex: 1, lineHeight: 18 }}>
            {item.text}
          </Text>
        </View>
      );
    }
    return <ChatBubble role={item.role === "user" ? "user" : "bot"} text={item.text} />;
  };

  return (
    <ScreenContainer className="flex-1 bg-background" edges={["top", "left", "right"]}>

      {/* ─── Header Bar ─────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.06)",
          backgroundColor: "#151718",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "rgba(10,126,164,0.18)",
            borderWidth: 1.5,
            borderColor: "rgba(10,126,164,0.5)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>🤖</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#ECEDEE", fontSize: 15, fontWeight: "700", letterSpacing: 0.3 }}>
            KhidmatAI
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#4ADE80" }} />
            <Text style={{ color: "#9BA1A6", fontSize: 11 }}>Online · Home Services</Text>
          </View>
        </View>
      </View>

      {/* ─── Floating Notification Banner ─────────────────── */}
      {bannerNotif && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setBannerNotif(null)}
          style={{
            position: "absolute",
            top: 80,
            left: 12,
            right: 12,
            zIndex: 50,
            backgroundColor: colors.primary,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.45,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 22 }}>🔔</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" }}>
              KhidmatAI Alert
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 2 }} numberOfLines={2}>
              {bannerNotif.message}
            </Text>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      )}

      {/* ─── Messages List ─────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 16,
            paddingBottom: 8,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
              <Text style={{ fontSize: 52, marginBottom: 16 }}>🏡</Text>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#ECEDEE", textAlign: "center" }}>
                Welcome to KhidmatAI
              </Text>
              <Text style={{ fontSize: 13, color: "#9BA1A6", textAlign: "center", marginTop: 8, lineHeight: 20, paddingHorizontal: 32 }}>
                Book home services in Urdu, Roman Urdu, or English.{"\n"}Just type or tap a quick shortcut below.
              </Text>
              <View
                style={{
                  marginTop: 28,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: "rgba(10,126,164,0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(10,126,164,0.25)",
                }}
              >
                <Text style={{ color: "#0a7ea4", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                  💡 Try: "AC technician G-13 kal subah"
                </Text>
              </View>
            </View>
          }
          scrollEnabled={true}
        />

        {/* ─── Premium Dynamic Thinking Process Block ─────────────────── */}
        {loading && (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginHorizontal: 12,
              marginBottom: 10,
              backgroundColor: "rgba(30, 32, 34, 0.85)",
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: "rgba(10, 126, 164, 0.25)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 }}>
              <ActivityIndicator size="small" color="#0a7ea4" />
              <Text style={{ color: "#ECEDEE", fontSize: 14, fontWeight: "700", letterSpacing: 0.3 }}>
                KhidmatAI Thinking Process
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              {thinkingSteps.map((step, idx) => {
                const isCompleted = idx < activeThinkingIndex;
                const isActive = idx === activeThinkingIndex;
                const isPending = idx > activeThinkingIndex;

                let icon = "○";
                let textColor = "#9BA1A6";
                let opacity = 0.5;
                let fontWeight: "400" | "700" = "400";

                if (isCompleted) {
                  icon = "✓";
                  textColor = "#4ADE80";
                  opacity = 0.75;
                } else if (isActive) {
                  icon = "⏳";
                  textColor = "#0a7ea4";
                  opacity = 1;
                  fontWeight = "700";
                }

                return (
                  <View 
                    key={idx} 
                    style={{ 
                      flexDirection: "row", 
                      alignItems: "center", 
                      gap: 10,
                      opacity,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: textColor, width: 20, textAlign: "center" }}>
                      {icon}
                    </Text>
                    <Text style={{ color: textColor, fontSize: 13, fontWeight, flex: 1 }}>
                      {step}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        <InputBar onSend={handleSend} disabled={loading} />
      </KeyboardAvoidingView>

      {/* Interactive In-App Review Modal (Requirement 5 Complete Action) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-background rounded-t-3xl p-6 border-t border-muted">
            <View className="items-center mb-4">
              <View className="w-12 h-1.5 bg-muted rounded-full mb-4" />
              <Text className="text-3xl">🌟</Text>
              <Text className="text-xl font-bold text-foreground text-center mt-2">
                Rate Your Service
              </Text>
              <Text className="text-sm text-muted text-center mt-1">
                Kaisa raha aapka experience with **{reviewProviderName}**?
              </Text>
            </View>

            {/* Interactive Stars */}
            <View className="flex-row justify-center py-4 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity 
                  key={star} 
                  onPress={() => setUserRating(star)}
                  className="mx-2"
                >
                  <Text className="text-4xl" style={{ opacity: star <= userRating ? 1 : 0.3 }}>
                    ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Review Comment Input */}
            <Text className="text-xs font-bold text-foreground mb-1">Apna Feedback Likhein:</Text>
            <TextInput
              className="bg-card border border-muted text-foreground p-3 rounded-xl mb-6 min-h-[80]"
              placeholder="E.g., Buhat acha kaam kiya, time par aaye. (English / Urdu)"
              placeholderTextColor="#888"
              multiline={true}
              numberOfLines={3}
              value={userComment}
              onChangeText={setUserComment}
            />

            {/* Actions */}
            <View className="flex-row justify-between gap-4">
              <TouchableOpacity
                onPress={() => setReviewModalVisible(false)}
                className="flex-1 bg-muted/20 border border-muted py-3 rounded-xl items-center"
              >
                <Text className="text-foreground font-semibold">Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReviewSubmit}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-bold">Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

