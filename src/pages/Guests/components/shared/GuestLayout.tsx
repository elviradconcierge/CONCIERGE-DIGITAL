/**
 * Guest Layout Component
 *
 * Main layout wrapper for all guest pages
 * Includes: Header, Announcement Banner, Content Area, Bottom Navigation
 * Manages shared state and navigation logic
 */

import { ReactNode } from "react";
import { GuestHeader } from "./GuestHeader";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { BottomNavigation, NavigationTab } from "./BottomNavigation";

interface GuestLayoutProps {
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

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        isVisible={!hideNavigation}
      />
    </div>
  );
};
