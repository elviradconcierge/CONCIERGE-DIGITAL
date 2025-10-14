/**
 * Guest Dashboard
 *
 * Main dashboard for authenticated guests.
 * Integrates all pages with shared layout (header, announcements, navigation)
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGuestSession,
  clearGuestSession,
  type GuestData,
  type HotelData,
} from "../../services/guestAuth.service";
import { GuestLayout, NavigationTab } from "./components/shared";
import { HomePage, ServicesPage, DineInPage, ShopPage } from "./pages";
import { useUpdateGuestDND } from "../../hooks/queries";

export const GuestDashboard = () => {
  const navigate = useNavigate();
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [hotelData, setHotelData] = useState<HotelData | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>("home");
  const [isDndActive, setIsDndActive] = useState(false);

  // DND mutation hook
  const { mutate: updateDND, isPending: isDndUpdating } = useUpdateGuestDND();

  useEffect(() => {
    console.log("🏠 [Guest Dashboard] Component mounted");

    // Get guest session
    const session = getGuestSession();

    if (!session || !session.guestData) {
      console.warn(
        "⚠️ [Guest Dashboard] No guest session found, redirecting to login"
      );
      navigate("/guest");
      return;
    }

    console.log("✅ [Guest Dashboard] Guest session loaded:", {
      id: session.guestData.id,
      name: session.guestData.guest_name,
      room: session.guestData.room_number,
      hotel_id: session.guestData.hotel_id,
    });
    console.log("🏨 [Guest Dashboard] Hotel data:", session.hotelData);

    // Check if access has expired
    const expiresAt = new Date(session.guestData.access_code_expires_at);
    const now = new Date();

    if (expiresAt < now) {
      console.warn("⚠️ [Guest Dashboard] Access code has expired");
      clearGuestSession();
      navigate("/guest");
      return;
    }

    console.log(
      "✅ [Guest Dashboard] Access code is valid until:",
      expiresAt.toISOString()
    );
    setGuestData(session.guestData);
    setHotelData(session.hotelData || null);
    setIsDndActive(session.guestData.dnd_status || false);
  }, [navigate]);

  // Log when activeTab changes
  useEffect(() => {
    console.log(
      `🎯 [Guest Dashboard] activeTab state changed to: ${activeTab}`
    );
  }, [activeTab]);

  const handleTabChange = (tab: NavigationTab) => {
    console.log(`📱 [Guest Dashboard] Tab change requested: ${tab}`);
    console.log(`📱 [Guest Dashboard] Current activeTab: ${activeTab}`);

    if (tab === "logout") {
      console.log(`🚪 [Guest Dashboard] Logout tab clicked`);
      handleLogout();
      return;
    }

    console.log(`📱 [Guest Dashboard] Setting activeTab to: ${tab}`);
    setActiveTab(tab);
  };

  const handleDndToggle = async (isActive: boolean) => {
    if (!guestData) {
      console.warn("🔔 [Guest Dashboard] No guest data, cannot toggle DND");
      return;
    }

    console.log(`🔔 [Guest Dashboard] DND toggle requested: ${isActive}`);

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
            "🔔 [Guest Dashboard] DND updated successfully:",
            updatedGuest
          );
          // Update local guest data
          setGuestData({ ...guestData, dnd_status: updatedGuest.dnd_status });
        },
        onError: (error) => {
          console.error("🔔 [Guest Dashboard] DND update failed:", error);
          // Revert optimistic update on error
          setIsDndActive(!isActive);
          alert("Failed to update Do Not Disturb status. Please try again.");
        },
      }
    );
  };

  const handleLogout = () => {
    console.log("🚪 [Guest Dashboard] Logging out...");
    clearGuestSession();
    navigate("/guest");
  };

  if (!guestData) {
    console.log("⏳ [Guest Dashboard] Loading guest session...");
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log(
    "🎨 [Guest Dashboard] Rendering dashboard for guest:",
    guestData.guest_name
  );

  // Render the active page
  const renderActivePage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage guestData={guestData} hotelId={guestData.hotel_id} />;
      case "services":
        return <ServicesPage />;
      case "dine-in":
        return <DineInPage />;
      case "shop":
        return <ShopPage />;
      default:
        return <HomePage guestData={guestData} hotelId={guestData.hotel_id} />;
    }
  };

  return (
    <GuestLayout
      guestName={guestData.guest_name}
      hotelName={hotelData?.name || "Hotel"}
      roomNumber={guestData.room_number}
      hotelId={guestData.hotel_id}
      isDndActive={isDndActive}
      isDndUpdating={isDndUpdating}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onDndToggle={handleDndToggle}
    >
      {renderActivePage()}
    </GuestLayout>
  );
};
