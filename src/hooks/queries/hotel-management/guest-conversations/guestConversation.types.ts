/**
 * Guest Conversation Type Definitions
 */

import { Tables, Insert, Update } from "../../queryUtils";

// ============================================================================
// BASE TYPES
// ============================================================================

export type GuestConversation = Tables<"guest_conversation">;
export type GuestMessage = Tables<"guest_messages">;
export type GuestConversationInsert = Insert<"guest_conversation">;
export type GuestMessageInsert = Insert<"guest_messages">;
export type GuestConversationUpdate = Update<"guest_conversation">;
export type GuestMessageUpdate = Update<"guest_messages">;

// ============================================================================
// EXTENDED TYPES
// ============================================================================

/**
 * Database Relationship Chain for Assigned Staff:
 * guest_conversation.assigned_staff_id → hotel_staff_personal_data.staff_id → hotel_staff.id
 *
 * This means assigned_staff_id references staff_id in hotel_staff_personal_data table,
 * which then references id in hotel_staff table.
 */
export type ConversationWithGuest = GuestConversation & {
  guests?: {
    id: string;
    guest_name: string;
    room_number: string;
    guest_personal_data?: {
      first_name: string;
      last_name: string;
      guest_email: string;
      phone_number: string;
    }[];
  };
  assigned_staff_data?: {
    staff_id: string;
    first_name: string;
    last_name: string;
    hotel_staff?: {
      id: string;
      employee_id: string;
      position: string;
      hotel_id: string;
    };
  };
  unread_count?: number;
  last_message?: GuestMessage;
};

/**
 * Message with related guest and profile data
 */
export type MessageWithDetails = GuestMessage & {
  guests?: {
    id: string;
    guest_name: string;
    room_number: string;
  };
  created_by_profile?: {
    id: string;
    email: string;
  };
};

// ============================================================================
// ENUMS
// ============================================================================

export type SenderType = "guest" | "staff";
export type ConversationStatus = "open" | "closed" | "pending";
