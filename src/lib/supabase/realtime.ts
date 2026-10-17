import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface RealtimeMessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface RealtimeNotificationPayload {
  id: string;
  userId: string;
  title: string;
  type: string;
  createdAt: string;
}

/**
 * Subscribes to live messages in an authorized conversation.
 * Returns an unsubscribe cleanup function to prevent memory and connection leaks.
 *
 * NOTE: The server verifies conversation membership before granting access tokens
 * and database RLS restricts message row delivery strictly to conversation participants.
 */
export function subscribeToConversation(
  conversationId: string,
  onMessage: (message: RealtimeMessagePayload) => void
): () => void {
  const supabase = createClient();
  const channelName = `conversation:${conversationId}`;

  const channel: RealtimeChannel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Message",
        filter: `conversationId=eq.${conversationId}`,
      },
      (payload: { new: Record<string, any> }) => {
        if (payload.new) {
          onMessage(payload.new as unknown as RealtimeMessagePayload);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribes to realtime notifications for the current authenticated user.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToUserNotifications(
  userId: string,
  onNotification: (notification: RealtimeNotificationPayload) => void
): () => void {
  const supabase = createClient();
  const channelName = `user-notifications:${userId}`;

  const channel: RealtimeChannel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Notification",
        filter: `userId=eq.${userId}`,
      },
      (payload: { new: Record<string, any> }) => {
        if (payload.new) {
          onNotification(payload.new as unknown as RealtimeNotificationPayload);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
