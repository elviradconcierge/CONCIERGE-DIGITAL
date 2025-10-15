/**
 * useDndManagement Hook
 *
 * Manages Do Not Disturb status updates
 */

import { useState } from "react";
import { useUpdateGuestDND } from "../../../hooks/queries";
import type { GuestData } from "../../../services/guestAuth.service";

interface UseDndManagementProps {
  guestData: GuestData | null;
  onGuestDataUpdate: (guestData: GuestData) => void;
}

interface UseDndManagementReturn {
  isDndActive: boolean;
  isDndUpdating: boolean;
  handleDndToggle: (isActive: boolean) => Promise<void>;
}

export const useDndManagement = ({
  guestData,
  onGuestDataUpdate,
}: UseDndManagementProps): UseDndManagementReturn => {
  const [isDndActive, setIsDndActive] = useState(
    guestData?.dnd_status || false
  );
  const { mutate: updateDND, isPending: isDndUpdating } = useUpdateGuestDND();

  const handleDndToggle = async (isActive: boolean) => {
    if (!guestData) {
      console.warn("🔔 [useDndManagement] No guest data, cannot toggle DND");
      return;
    }

    console.log(`🔔 [useDndManagement] DND toggle requested: ${isActive}`);

    // Optimistically update UI
    setIsDndActive(isActive);

    // Update database
    updateDND(
      {
        guestId: guestData.id,
        dndStatus: isActive,
      },
      {
        onSuccess: (updatedGuest) => {
          console.log(
            "🔔 [useDndManagement] DND updated successfully:",
            updatedGuest
          );
          // Update parent guest data
          onGuestDataUpdate({
            ...guestData,
            dnd_status: updatedGuest.dnd_status,
          });
        },
        onError: (error) => {
          console.error("🔔 [useDndManagement] DND update failed:", error);
          // Revert optimistic update on error
          setIsDndActive(!isActive);
          alert("Failed to update Do Not Disturb status. Please try again.");
        },
      }
    );
  };

  return {
    isDndActive,
    isDndUpdating,
    handleDndToggle,
  };
};
