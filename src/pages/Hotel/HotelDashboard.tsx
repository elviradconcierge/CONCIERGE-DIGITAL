import { useState, useMemo } from "react";
import { GenericDashboardLayout } from "../../components/layout";
import { PageContainer, PageHeader } from "../../components/common";
import { HOTEL_NAVIGATION } from "../../constants";
import { useHotelStaff } from "../../hooks/hotel/useHotelStaff";
import { canAccessRoute } from "../../utils/ui/permission";
import { ChatManagementPage } from "./ChatManagementPage";
import { GuestManagementPage } from "./GuestManagementPage";
import { EmergencyContactsPage } from "./EmergencyContactsPage";
import { QARecommendationsPage } from "./QARecommendationsPage";
import { AnnouncementsPage } from "./AnnouncementsPage";
import { ThirdPartyManagementPage } from "./ThirdPartyManagementPage";
import { HotelStaffPage } from "./HotelStaffPage";
import { AmenitiesPage } from "./AmenitiesPage";
import { HotelRestaurantPage } from "./HotelRestaurantPage";
import { HotelShopPage } from "./HotelShopPage";
import { SettingsPage } from "./SettingsPage";
import { AISupportPage } from "./AISupportPage";

export const HotelDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const { hotelStaff } = useHotelStaff();

  // Filter navigation items based on user's role
  const filteredNavigationItems = useMemo(() => {
    return HOTEL_NAVIGATION.filter((item) =>
      canAccessRoute(hotelStaff, item.id)
    );
  }, [hotelStaff]);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <PageContainer>
            <PageHeader title="Hotel Overview" />
            <p className="text-gray-600 mt-4">
              Hotel operations dashboard overview
            </p>
          </PageContainer>
        );
      case "hotel-staff":
        return <HotelStaffPage />;
      case "chat-management":
        return <ChatManagementPage />;
      case "guest-management":
        return <GuestManagementPage />;
      case "amenities":
        return <AmenitiesPage />;
      case "hotel-restaurant":
        return <HotelRestaurantPage />;
      case "hotel-shop":
        return <HotelShopPage />;
      case "announcements":
        return <AnnouncementsPage />;
      case "qa-recommendations":
        return <QARecommendationsPage />;
      case "emergency-contacts":
        return <EmergencyContactsPage />;
      case "third-party-management":
        return <ThirdPartyManagementPage />;
      case "ai-support":
        return <AISupportPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return (
          <PageContainer>
            <PageHeader title="Hotel Overview" />
          </PageContainer>
        );
    }
  };

  return (
    <GenericDashboardLayout
      title="Centro Hotel Mondial"
      subtitle={hotelStaff?.position || "Staff Member"}
      systemLabel=""
      navigationItems={filteredNavigationItems}
      activeItem={activeSection}
      onNavigate={setActiveSection}
    >
      {renderContent()}
    </GenericDashboardLayout>
  );
};
