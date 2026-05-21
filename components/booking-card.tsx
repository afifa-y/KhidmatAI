import { View, Text, ScrollView } from "react-native";
import { cn } from "@/lib/utils";
export interface BookingNotification {
  type: string;
  message: string;
  scheduled_at: string;
}

export interface BookingConfirmation {
  booking_code: string;
  service: string;
  location: string;
  time: string;
  provider_name: string;
  provider_phone?: string;
  notifications?: BookingNotification[];
}

export interface BookingCardProps {
  booking: BookingConfirmation;
}

export function BookingCard({ booking }: BookingCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View className="mb-3 flex-row justify-start">
      <ScrollView
        className="max-w-xs rounded-2xl rounded-bl-none bg-success/5 border border-success"
        scrollEnabled={false}
      >
        <View className="p-4">
          {/* Header */}
          <View className="mb-4 items-center">
            <Text className="text-2xl">✅</Text>
            <Text className="mt-2 text-lg font-bold text-success">Booking Confirmed!</Text>
          </View>

          {/* Booking code */}
          <View className="mb-4 rounded-lg bg-success/10 px-3 py-2">
            <Text className="text-xs font-semibold text-muted">Booking Code</Text>
            <Text className="mt-1 font-mono text-base font-bold text-foreground">
              {booking.booking_code}
            </Text>
          </View>

          {/* Details */}
          <View className="mb-4 gap-3 border-b border-border pb-4">
            <DetailRow label="Service" value={booking.service} />
            <DetailRow label="Location" value={booking.location} />
            <DetailRow label="Time" value={booking.time} />
            <DetailRow label="Provider" value={booking.provider_name} />
            {booking.provider_phone && (
              <DetailRow label="Phone" value={booking.provider_phone} />
            )}
          </View>

          {/* Notifications */}
          {booking.notifications && booking.notifications.length > 0 && (
            <View>
              <Text className="mb-2 text-xs font-semibold text-muted">Notifications</Text>
              <View className="gap-2">
                {booking.notifications.map((notif, index) => (
                  <View
                    key={index}
                    className="rounded-lg bg-surface px-3 py-2"
                  >
                    <Text className="text-xs font-semibold text-foreground">
                      {notif.type}
                    </Text>
                    <Text className="mt-1 text-xs text-muted">{notif.message}</Text>
                    <Text className="mt-1 text-xs text-muted">
                      📅 {formatDate(notif.scheduled_at)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm font-medium text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}
