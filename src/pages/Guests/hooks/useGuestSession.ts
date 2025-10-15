/**
 * useGuestSession Hook
 *
 * Manages guest session loading, validation, and logout
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGuestSession,
  clearGuestSession,
  type GuestData,
  type HotelData,
} from "../../../services/guestAuth.service";

interface UseGuestSessionReturn {
  guestData: GuestData | null;
  hotelData: HotelData | null;
  isLoading: boolean;
  handleLogout: () => void;
}

export const useGuestSession = (): UseGuestSessionReturn => {
  const navigate = useNavigate();
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [hotelData, setHotelData] = useState<HotelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("🏠 [useGuestSession] Loading session");

    // Get guest session
    const session = getGuestSession();

    if (!session || !session.guestData) {
      console.warn(
        "⚠️ [useGuestSession] No guest session found, redirecting to login"
      );
      navigate("/guest");
      return;
    }

    console.log("✅ [useGuestSession] Guest session loaded:", {
      id: session.guestData.id,
      name: session.guestData.guest_name,
      room: session.guestData.room_number,
      hotel_id: session.guestData.hotel_id,
    });

    // Check if access has expired
    const expiresAt = new Date(session.guestData.access_code_expires_at);
    const now = new Date();

    if (expiresAt < now) {
      console.warn("⚠️ [useGuestSession] Access code has expired");
      clearGuestSession();
      navigate("/guest");
      return;
    }

    console.log(
      "✅ [useGuestSession] Access code is valid until:",
      expiresAt.toISOString()
    );

    setGuestData(session.guestData);
    setHotelData(session.hotelData || null);
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    console.log("🚪 [useGuestSession] Logging out...");
    clearGuestSession();
    navigate("/guest");
  };

  return {
    guestData,
    hotelData,
    isLoading,
    handleLogout,
  };
};
