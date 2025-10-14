/**
 * Guests Data View Component
 *
 * Renders guests in table or grid view with pagination and action handlers.
 */

import React from "react";
import {
  GenericDataView,
  GenericCard,
  CardActionFooter,
} from "../../../../components/common/data-display";
import { guestTableColumns, guestGridColumns } from "./GuestColumns";
import type { GuestWithPersonalData } from "../../../../hooks/queries/hotel-management/guests";
import { User, Mail, Phone, Building2 } from "lucide-react";

interface GuestsDataViewProps {
  viewMode: "list" | "grid";
  filteredData: Record<string, unknown>[];
  handleRowClick: (guest: GuestWithPersonalData) => void;
  onEdit: (guest: GuestWithPersonalData) => void;
  onDelete: (guest: GuestWithPersonalData) => void;
}

/**
 * Helper to get personal data from guest
 */
const getPersonalData = (guest: GuestWithPersonalData) => {
  if (!guest.guest_personal_data) return null;
  return Array.isArray(guest.guest_personal_data)
    ? guest.guest_personal_data[0]
    : guest.guest_personal_data;
};

/**
 * Guest Card Component for Grid View
 */
const GuestCard: React.FC<{
  guest: GuestWithPersonalData;
  onClick: () => void;
  onEdit?: (guest: GuestWithPersonalData) => void;
  onDelete?: (guest: GuestWithPersonalData) => void;
}> = ({ guest, onClick, onEdit, onDelete }) => {
  const personalData = getPersonalData(guest);
  const firstName = personalData?.first_name || "";
  const lastName = personalData?.last_name || "";
  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : guest.guest_name || "N/A";
  const email = personalData?.guest_email || "N/A";
  const phone = personalData?.phone_number || "N/A";
  const status = guest.is_active ? "Active" : "Inactive";

  // Build sections array
  const sections = [
    {
      icon: <Mail className="w-4 h-4" />,
      content: <span className="truncate">{email}</span>,
    },
    {
      icon: <Phone className="w-4 h-4" />,
      content: phone,
    },
  ];

  // Add country if available
  if (personalData?.country) {
    sections.push({
      icon: <Building2 className="w-4 h-4" />,
      content: (
        <>
          <span className="font-medium">Country:</span> {personalData.country}
        </>
      ),
    });
  }

  return (
    <GenericCard
      icon={<User className="w-6 h-6 text-blue-600" />}
      iconBgColor="bg-blue-100"
      title={fullName}
      subtitle={
        <div className="flex items-center">
          <Building2 className="w-3 h-3 mr-1" />
          <span>Room {guest.room_number || "N/A"}</span>
        </div>
      }
      badge={{
        label: status,
        variant: "soft",
      }}
      sections={sections}
      footer={
        <CardActionFooter
          onEdit={onEdit ? () => onEdit(guest) : undefined}
          onDelete={onDelete ? () => onDelete(guest) : undefined}
        />
      }
      onClick={onClick}
    />
  );
};

/**
 * Guests data view with table and grid rendering
 */
export const GuestsDataView: React.FC<GuestsDataViewProps> = ({
  viewMode,
  filteredData,
  handleRowClick,
  onEdit,
  onDelete,
}) => {
  return (
    <GenericDataView<GuestWithPersonalData>
      viewMode={viewMode}
      filteredData={filteredData}
      tableColumns={guestTableColumns}
      gridColumns={guestGridColumns}
      getItemId={(guest) => guest.id}
      renderCard={(guest, onClick) => (
        <GuestCard
          guest={guest}
          onClick={onClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
      onItemClick={handleRowClick}
      emptyMessage="No guests found"
    />
  );
};
