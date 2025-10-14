/**
 * useGuestChat Hook
 *
 * Custom hook for managing guest-to-staff chat functionality
 *
 * Features:
 * - Automatically creates or fetches existing conversation
 * - Fetches and displays messages
 * - Sends new messages
 * - Marks messages as read
 * - Real-time message subscriptions
 *
 * Uses existing query hooks from hotel-management/guest-conversations
 */

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../../../lib/supabase";
import {
  useConversationByGuest,
  useConversationMessages,
  useCreateConversation,
  useSendMessage,
  useMarkMessagesAsRead,
} from "../../../../hooks/queries/hotel-management/guest-conversations";
import type { Message } from "../../../../types/chat";
import type {
  MessageWithDetails,
  GuestConversation,
} from "../../../../hooks/queries/hotel-management/guest-conversations/guestConversation.types";

interface UseGuestChatProps {
  guestId: string;
  hotelId: string;
}

interface UseGuestChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  conversationId: string | undefined;
  unreadCount: number;
}

/**
 * Find a suitable staff member for the guest conversation
 * Priority: Manager > Reception staff
 * Returns hotel_staff.id to assign to conversation
 */
const findAvailableStaff = async (hotelId: string): Promise<string | null> => {
  console.log("👥 [useGuestChat] Finding available staff for hotel:", hotelId);

  // Query hotel staff with Manager or Reception department
  const { data: staffData, error } = await supabase
    .from("hotel_staff")
    .select(
      `
      id,
      employee_id,
      position,
      department,
      hotel_staff_personal_data!hotel_staff_staff_personal_data_id_fkey(
        first_name,
        last_name
      )
    `
    )
    .eq("hotel_id", hotelId)
    .in("position", ["Hotel Admin", "Hotel Staff"])
    .in("department", ["Manager", "Reception"])
    .eq("status", "active")
    .order("department", { ascending: true }) // Manager first
    .limit(1);

  if (error) {
    console.error("❌ [useGuestChat] Error finding staff:", error);
    return null;
  }

  if (staffData && staffData.length > 0) {
    const staff = staffData[0];
    const personalDataArray = staff.hotel_staff_personal_data as Array<{
      first_name: string;
      last_name: string;
    }> | null;
    const personalData = personalDataArray?.[0];
    console.log("✅ [useGuestChat] Found staff:", {
      hotel_staff_id: staff.id,
      name: `${personalData?.first_name} ${personalData?.last_name}`,
      position: staff.position,
      department: staff.department,
    });
    // Return hotel_staff.id which will be assigned to guest_conversation.assigned_staff_id
    return staff.id;
  }

  console.warn("⚠️ [useGuestChat] No suitable staff found");
  return null;
};

/**
 * Transform database message to chat UI message format
 */
const transformMessage = (msg: MessageWithDetails): Message => {
  const isGuest = msg.sender_type === "guest";

  return {
    id: msg.id,
    content: msg.message_text,
    timestamp: new Date(msg.created_at),
    type: isGuest ? "sent" : "received",
    sender: {
      id: msg.created_by || "",
      name: isGuest
        ? msg.guests?.guest_name || "Guest"
        : msg.created_by_profile?.email?.split("@")[0] || "Staff",
      avatar: undefined, // Can add avatar logic later
    },
  };
};

export const useGuestChat = ({
  guestId,
  hotelId,
}: UseGuestChatProps): UseGuestChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query hooks
  const {
    data: conversation,
    isLoading: isLoadingConversation,
    error: conversationError,
  } = useConversationByGuest(guestId, hotelId);

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useConversationMessages(conversation?.id);

  // Mutation hooks
  const { mutate: createConversation } = useCreateConversation();
  const { mutate: sendMessageMutation } = useSendMessage();
  const { mutate: markAsRead } = useMarkMessagesAsRead();

  const conversationId = conversation?.id;

  // Transform and set messages when data changes
  useEffect(() => {
    if (messagesData) {
      const transformed = messagesData.map(transformMessage);
      setMessages(transformed);

      // Count unread staff messages
      const unread = messagesData.filter(
        (msg: MessageWithDetails) => msg.sender_type === "staff" && !msg.is_read
      ).length;
      setUnreadCount(unread);

      console.log("💬 [useGuestChat] Messages loaded:", {
        total: transformed.length,
        unread,
        conversationId,
      });
    }
  }, [messagesData, conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup realtime subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    console.log(
      "🔔 [useGuestChat] Setting up realtime subscription:",
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
          console.log("✨ [useGuestChat] New message received:", _payload);

          // Fetch updated messages to get full details
          // The useConversationMessages query will auto-refetch
          // due to React Query's refetch on window focus
        }
      )
      .subscribe();

    return () => {
      console.log("🔕 [useGuestChat] Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Mark messages as read when chat is viewed
  useEffect(() => {
    if (conversationId && unreadCount > 0) {
      console.log("✅ [useGuestChat] Marking messages as read");
      markAsRead({
        conversationId,
        messageIds:
          messagesData
            ?.filter(
              (msg: MessageWithDetails) =>
                msg.sender_type === "staff" && !msg.is_read
            )
            .map((msg: MessageWithDetails) => msg.id) || [],
      });
    }
  }, [conversationId, unreadCount, markAsRead, messagesData]);

  /**
   * Send a new message
   * Creates conversation if it doesn't exist (with assigned staff)
   */
  const sendMessage = async (content: string) => {
    console.log("📤 [useGuestChat] Sending message:", {
      content,
      conversationId,
    });

    // If no conversation exists, create one first
    if (!conversationId) {
      console.log("🆕 [useGuestChat] Creating new conversation");

      // Find available staff member
      const assignedStaffId = await findAvailableStaff(hotelId);

      if (!assignedStaffId) {
        console.error(
          "❌ [useGuestChat] Cannot create conversation: No staff available"
        );
        return;
      }

      createConversation(
        {
          guest_id: guestId,
          hotel_id: hotelId,
          assigned_staff_id: assignedStaffId,
          status: "active",
          last_message_at: new Date().toISOString(),
        },
        {
          onSuccess: (newConversation: GuestConversation) => {
            console.log(
              "✅ [useGuestChat] Conversation created:",
              newConversation.id
            );

            // Now send the message
            sendMessageMutation({
              conversation_id: newConversation.id,
              message_text: content,
              sender_type: "guest",
              guest_id: guestId,
              is_read: false,
            });
          },
          onError: (error: Error) => {
            console.error(
              "❌ [useGuestChat] Failed to create conversation:",
              error
            );
          },
        }
      );
    } else {
      // Conversation exists, just send the message
      sendMessageMutation({
        conversation_id: conversationId,
        message_text: content,
        sender_type: "guest",
        guest_id: guestId,
        is_read: false,
      });
    }
  };

  return {
    messages,
    isLoading: isLoadingConversation || isLoadingMessages,
    error: (conversationError || messagesError) as Error | null,
    sendMessage,
    conversationId,
    unreadCount,
  };
};
