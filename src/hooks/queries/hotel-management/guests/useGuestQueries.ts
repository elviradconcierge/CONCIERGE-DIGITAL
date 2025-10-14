/**
 * Guest Query Hooks
 *
 * React Query hooks for managing guest data operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../lib/supabase";
import { guestKeys, GUEST_SELECT } from "./guest.constants";
import { normalizeGuests } from "./guest.transformers";
import type {
  Guest,
  GuestCreationData,
  GuestUpdateData,
  GuestDeletionData,
} from "./guest.types";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetches all guests for a hotel with personal data
 */
export const useGuests = (hotelId: string) => {
  return useQuery({
    queryKey: guestKeys.list({ hotelId }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guests")
        .select(GUEST_SELECT)
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return normalizeGuests(data as Guest[]);
    },
  });
};

/**
 * Fetches a single guest by ID with personal data
 */
export const useGuestById = (guestId: string) => {
  return useQuery({
    queryKey: guestKeys.detail(guestId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guests")
        .select(GUEST_SELECT)
        .eq("id", guestId)
        .single();

      if (error) throw error;

      return data as Guest;
    },
    enabled: !!guestId,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Creates a new guest with personal data
 *
 * This mutation performs a transaction-like operation:
 * 1. Creates the guest record
 * 2. Creates associated personal data
 * 3. If personal data creation fails, the guest record remains (manual cleanup needed)
 *
 * @example
 * ```tsx
 * const createGuest = useCreateGuest();
 *
 * createGuest.mutate({
 *   guestData: {
 *     hotel_id: 'hotel-123',
 *     room_number: '101',
 *     guest_name: 'John Doe',
 *     access_code_expires_at: new Date().toISOString(),
 *     is_active: true,
 *   },
 *   personalData: {
 *     first_name: 'John',
 *     last_name: 'Doe',
 *     guest_email: 'john@example.com',
 *     phone_number: '+1234567890',
 *   },
 * });
 * ```
 */
export const useCreateGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ guestData, personalData }: GuestCreationData) => {
      // First, create the guest
      const { data: guest, error: guestError } = await supabase
        .from("guests")
        .insert(guestData)
        .select()
        .single();

      if (guestError) throw guestError;

      // Then, create the personal data
      const { data: personalDataResult, error: personalDataError } =
        await supabase
          .from("guest_personal_data")
          .insert({
            ...personalData,
            guest_id: guest.id,
          })
          .select()
          .single();

      if (personalDataError) throw personalDataError;

      return { guest, personalData: personalDataResult };
    },
    onSuccess: (_, { guestData }) => {
      queryClient.invalidateQueries({
        queryKey: guestKeys.list({ hotelId: guestData.hotel_id }),
      });
    },
  });
};

/**
 * Updates an existing guest and/or their personal data
 *
 * This mutation allows flexible updates:
 * - Update only guest data
 * - Update only personal data
 * - Update both guest and personal data
 *
 * @example
 * ```tsx
 * const updateGuest = useUpdateGuest();
 *
 * // Update only guest data
 * updateGuest.mutate({
 *   id: 'guest-123',
 *   hotelId: 'hotel-456',
 *   guestData: { room_number: '102' },
 * });
 *
 * // Update only personal data
 * updateGuest.mutate({
 *   id: 'guest-123',
 *   hotelId: 'hotel-456',
 *   personalData: { phone_number: '+9876543210' },
 * });
 *
 * // Update both
 * updateGuest.mutate({
 *   id: 'guest-123',
 *   hotelId: 'hotel-456',
 *   guestData: { is_active: false },
 *   personalData: { guest_email: 'newemail@example.com' },
 * });
 * ```
 */
export const useUpdateGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, guestData, personalData }: GuestUpdateData) => {
      // Update guest data if provided
      if (guestData) {
        const { error: guestError } = await supabase
          .from("guests")
          .update(guestData)
          .eq("id", id);

        if (guestError) throw guestError;
      }

      // Update personal data if provided
      if (personalData) {
        const { error: personalDataError } = await supabase
          .from("guest_personal_data")
          .update(personalData)
          .eq("guest_id", id);

        if (personalDataError) throw personalDataError;
      }

      return { id };
    },
    onSuccess: (_, { hotelId }) => {
      queryClient.invalidateQueries({
        queryKey: guestKeys.list({ hotelId }),
      });
    },
  });
};

/**
 * Deletes a guest and their personal data
 *
 * This mutation handles the foreign key constraint by:
 * 1. Deleting personal data first
 * 2. Then deleting the guest record
 *
 * @example
 * ```tsx
 * const deleteGuest = useDeleteGuest();
 *
 * deleteGuest.mutate({
 *   id: 'guest-123',
 *   hotelId: 'hotel-456',
 * });
 * ```
 */
export const useDeleteGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: GuestDeletionData) => {
      // Delete personal data first (foreign key constraint)
      const { error: personalDataError } = await supabase
        .from("guest_personal_data")
        .delete()
        .eq("guest_id", id);

      if (personalDataError) throw personalDataError;

      // Then delete the guest
      const { error: guestError } = await supabase
        .from("guests")
        .delete()
        .eq("id", id);

      if (guestError) throw guestError;

      return id;
    },
    onSuccess: (_, { hotelId }) => {
      queryClient.invalidateQueries({
        queryKey: guestKeys.list({ hotelId }),
      });
    },
  });
};
