/**
 * useMessageSubscription Hook
 *
 * Manages real-time subscription to new messages in a conversation
 */

import { useEffect } from "react";
import { supabase } from "../../../../../lib/supabase";

interface UseMessageSubscriptionProps {
  conversationId: string | undefined;
  onNewMessage?: () => void;
}

export const useMessageSubscription = ({
  conversationId,
  onNewMessage,
}: UseMessageSubscriptionProps) => {
  useEffect(() => {
    if (!conversationId) return;

    console.log(
      "🔔 [useMessageSubscription] Setting up realtime subscription:",
      conversationId
    );

    const channel = supabase
      .channel(`guest-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guest_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (_payload: unknown) => {
          console.log(
            "✨ [useMessageSubscription] New message received:",
            _payload
          );

          // Trigger callback if provided
          onNewMessage?.();

          // The useConversationMessages query will auto-refetch
          // due to React Query's refetch on window focus
        }
      )
      .subscribe();

    return () => {
      console.log(
        "🔕 [useMessageSubscription] Cleaning up realtime subscription"
      );
      supabase.removeChannel(channel);
    };
  }, [conversationId, onNewMessage]);
};
