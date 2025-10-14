/**
 * Guest CRUD Hook
 *
 * Provides CRUD state management and operations for guests using the useCRUD hook.
 */

import { FormFieldConfig } from "../../../hooks";
import type {
  GuestWithPersonalData,
  GuestCreationData,
  GuestUpdateData,
} from "../../../hooks/queries/hotel-management/guests";
import {
  useCreateGuest,
  useUpdateGuest,
  useDeleteGuest,
} from "../../../hooks/queries/hotel-management/guests";
import { useCRUDWithMutations, getHotelId } from "./useCRUDWithMutations";
import type { Json } from "../../../types/supabase";

/**
 * Enhanced Guest type with UI-specific fields
 */
export type EnhancedGuest = GuestWithPersonalData & {
  fullName?: string;
  displayEmail?: string;
};

// Make sure Guest satisfies the Record<string, unknown> constraint
type GuestForCRUD = GuestWithPersonalData & Record<string, unknown>;

interface UseGuestCRUDProps {
  initialGuests: GuestWithPersonalData[];
  formFields: FormFieldConfig[];
}

/**
 * Hook for managing guest CRUD operations
 *
 * @param props - Initial guests and form fields configuration
 * @returns CRUD state and handlers for guests
 *
 * @example
 * ```tsx
 * const guestCRUD = useGuestCRUD({
 *   initialGuests: guests,
 *   formFields: GuestFormFields,
 * });
 * ```
 */
export const useGuestCRUD = ({
  initialGuests,
  formFields,
}: UseGuestCRUDProps) => {
  // Use the CRUD with mutations helper for database integration
  const crud = useCRUDWithMutations<
    GuestForCRUD,
    GuestCreationData,
    GuestUpdateData
  >({
    initialData: initialGuests as GuestForCRUD[],
    formFields,
    searchFields: ["guest_name", "room_number", "guest_email"],
    defaultViewMode: "list",
    createMutation: useCreateGuest(),
    updateMutation: useUpdateGuest(),
    deleteMutation: useDeleteGuest(),
    // Transform form data to database insert format
    transformCreate: (data) => {
      // Split name into first_name and last_name if provided as guest_name
      const fullName = (data.guest_name as string) || "";
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Generate default verification code and expiration
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30); // 30 days from now

      return {
        guestData: {
          room_number: (data.room_number as string) || "",
          guest_name: fullName || "",
          hashed_verification_code:
            (data.hashed_verification_code as string) || "default",
          access_code_expires_at: expirationDate.toISOString(),
          is_active: (data.is_active as boolean) ?? true,
          dnd_status: (data.dnd_status as boolean) ?? false,
          hotel_id: getHotelId(),
        },
        personalData: {
          first_name: firstName,
          last_name: lastName,
          guest_email: (data.guest_email as string) || "",
          phone_number: (data.phone_number as string) || undefined,
          date_of_birth: (data.date_of_birth as string) || undefined,
          country: (data.country as string) || undefined,
          language: (data.language as string) || undefined,
          additional_guests_data:
            (data.additional_guests_data as Json) || undefined,
        },
      };
    },
    // Transform form data to database update format
    transformUpdate: (id, data) => {
      // Split name into first_name and last_name if provided as guest_name
      const fullName = (data.guest_name as string) || "";
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      return {
        id: id as string,
        hotelId: getHotelId(),
        guestData: {
          room_number: data.room_number as string,
          guest_name: fullName,
          is_active: data.is_active as boolean,
          dnd_status: data.dnd_status as boolean,
        },
        personalData: {
          first_name: firstName,
          last_name: lastName,
          guest_email: (data.guest_email as string) || undefined,
          phone_number: (data.phone_number as string) || undefined,
          date_of_birth: (data.date_of_birth as string) || undefined,
          country: (data.country as string) || undefined,
          language: (data.language as string) || undefined,
          additional_guests_data:
            (data.additional_guests_data as Json) || undefined,
        },
      };
    },
    // Transform ID for delete operation
    transformDelete: (id) => ({
      id: id as string,
      hotelId: getHotelId(),
    }),
    // Optional: Customize how new entities appear in local state
    formatNewEntity: (formData) => ({
      ...formData,
      created_at: new Date().toISOString(),
      is_active: (formData.is_active as boolean) ?? true,
      dnd_status: (formData.dnd_status as boolean) ?? false,
    }),
    formatUpdatedEntity: (formData) => formData,
  });

  // Map crud result to the expected return structure
  return {
    data: crud.data as GuestWithPersonalData[],
    searchAndFilter: crud.searchAndFilter,
    modalState: crud.modalState,
    modalActions: crud.modalActions,
    formState: crud.formState,
    formActions: crud.formActions,
    handleStatusToggle: crud.handleStatusToggle,
    handleCreateSubmit: crud.handleCreateSubmit,
    handleEditSubmit: crud.handleEditSubmit,
    handleDeleteConfirm: crud.handleDeleteConfirm,
  };
};
