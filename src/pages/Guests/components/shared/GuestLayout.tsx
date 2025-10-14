/**
 * Guest Layout Component
 *
 * Main layout wrapper for all guest pages
 * Includes: Header, Announcement Banner, Content Area, Bottom Navigation, Floating Widget
 * Manages shared state and navigation logic
 */

import { ReactNode, useState } from "react";
import { GuestHeader } from "./GuestHeader";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { BottomNavigation, NavigationTab } from "./BottomNavigation";
import { FloatingWidget } from "./FloatingWidget";
import { RequestHistoryModal } from "./RequestHistoryModal";
import { GuestChatModal } from "../Chat";

interface GuestLayoutProps {
  guestId: string;
  guestName: string;
  hotelName: string;
  roomNumber: string;
  hotelId: string;
  isDndActive?: boolean;
  isDndUpdating?: boolean;
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onDndToggle: (isActive: boolean) => void;
  hideNavigation?: boolean;
  children: ReactNode;
}

export const GuestLayout = ({
  guestId,
  guestName,
  hotelName,
  roomNumber,
  hotelId,
  isDndActive = false,
  isDndUpdating = false,
  activeTab,
  onTabChange,
  onDndToggle,
  hideNavigation = false,
  children,
}: GuestLayoutProps) => {
  // Modal state
  const [isRequestHistoryOpen, setIsRequestHistoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleClockClick = () => {
    console.log(
      "🕐 [GuestLayout] Clock widget clicked - Opening Request History modal"
    );
    setIsRequestHistoryOpen(true);
  };

  const handleChatClick = () => {
    console.log("💬 [GuestLayout] Chat widget clicked - Opening chat modal");
    setIsChatOpen(true);
  };

  const handleCloseRequestHistory = () => {
    console.log("🕐 [GuestLayout] Closing Request History modal");
    setIsRequestHistoryOpen(false);
  };

  const handleCloseChat = () => {
    console.log("💬 [GuestLayout] Closing chat modal");
    setIsChatOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <GuestHeader
        guestName={guestName}
        hotelName={hotelName}
        roomNumber={roomNumber}
        isDndActive={isDndActive}
        isDndUpdating={isDndUpdating}
        onDndToggle={onDndToggle}
      />

      {/* Announcement Banner - fetches from database */}
      <AnnouncementBanner hotelId={hotelId} />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 overflow-y-auto">{children}</main>

      {/* Floating Widget - Available on all pages */}
      <FloatingWidget
        onClockClick={handleClockClick}
        onChatClick={handleChatClick}
      />

      {/* Request History Modal */}
      <RequestHistoryModal
        isOpen={isRequestHistoryOpen}
        onClose={handleCloseRequestHistory}
      />

      {/* Guest Chat Modal */}
      <GuestChatModal
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        guestId={guestId}
        guestName={guestName}
        roomNumber={roomNumber}
        hotelId={hotelId}
        hotelName={hotelName}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        isVisible={!hideNavigation}
      />
    </div>
  );
};
