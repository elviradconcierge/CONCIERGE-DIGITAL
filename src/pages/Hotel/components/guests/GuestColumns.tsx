/**
 * Guest Columns Configuration
 *
 * Defines column configurations for guest table/grid views and detail fields.
 */

import { Users, Mail, Phone, Building2, Calendar } from "lucide-react";
import type { Column } from "../../../../types/table";
import type { GuestWithPersonalData } from "../../../../hooks/queries/hotel-management/guests";
import { StatusBadge } from "../../../../components/common";
import { formatDistanceToNow } from "date-fns";

/**
 * Helper to get personal data from guest (handles both single object and array)
 */
const getPersonalData = (guest: GuestWithPersonalData) => {
  if (!guest.guest_personal_data) return null;
  return Array.isArray(guest.guest_personal_data)
    ? guest.guest_personal_data[0]
    : guest.guest_personal_data;
};

/**
 * Table columns for guests
 */
export const guestTableColumns: Column<GuestWithPersonalData>[] = [
  {
    key: "guest_name",
    header: "Guest Name",
    accessor: (guest) => {
      const personalData = getPersonalData(guest);
      const firstName = personalData?.first_name || "";
      const lastName = personalData?.last_name || "";
      return firstName || lastName
        ? `${firstName} ${lastName}`.trim()
        : guest.guest_name || "N/A";
    },
  },
  {
    key: "guest_email",
    header: "Email",
    accessor: (guest) => {
      const personalData = getPersonalData(guest);
      return personalData?.guest_email || "N/A";
    },
  },
  {
    key: "room_number",
    header: "Room",
    accessor: "room_number",
  },
  {
    key: "phone_number",
    header: "Phone",
    accessor: (guest) => {
      const personalData = getPersonalData(guest);
      return personalData?.phone_number || "N/A";
    },
  },
  {
    key: "is_active",
    header: "Status",
    accessor: (guest) => (
      <StatusBadge
        status={guest.is_active ? "active" : "inactive"}
        label={guest.is_active ? "Active" : "Inactive"}
      />
    ),
  },
  {
    key: "created_at",
    header: "Checked In",
    accessor: (guest) => {
      if (!guest.created_at) return "N/A";
      return formatDistanceToNow(new Date(guest.created_at), {
        addSuffix: true,
      });
    },
  },
];

/**
 * Grid columns for guests (card view)
 */
export const guestGridColumns = [
  { key: "guest_name", label: "Guest Name" },
  { key: "room_number", label: "Room" },
  { key: "guest_email", label: "Email" },
  { key: "is_active", label: "Status" },
];

/**
 * Detail view fields for guest modal
 */
export const guestDetailFields = [
  {
    key: "guest_name",
    label: "Guest Name",
    icon: Users,
    accessor: (guest: GuestWithPersonalData) => {
      const personalData = getPersonalData(guest);
      const firstName = personalData?.first_name || "";
      const lastName = personalData?.last_name || "";
      return firstName || lastName
        ? `${firstName} ${lastName}`.trim()
        : guest.guest_name || "N/A";
    },
  },
  {
    key: "room_number",
    label: "Room Number",
    icon: Building2,
    accessor: (guest: GuestWithPersonalData) => guest.room_number || "N/A",
  },
  {
    key: "guest_email",
    label: "Email",
    icon: Mail,
    accessor: (guest: GuestWithPersonalData) => {
      const personalData = getPersonalData(guest);
      return personalData?.guest_email || "N/A";
    },
  },
  {
    key: "phone_number",
    label: "Phone",
    icon: Phone,
    accessor: (guest: GuestWithPersonalData) => {
      const personalData = getPersonalData(guest);
      return personalData?.phone_number || "N/A";
    },
  },
  {
    key: "country",
    label: "Country",
    icon: Building2,
    accessor: (guest: GuestWithPersonalData) => {
      const personalData = getPersonalData(guest);
      return personalData?.country || "N/A";
    },
  },
  {
    key: "language",
    label: "Language",
    icon: Users,
    accessor: (guest: GuestWithPersonalData) => {
      const personalData = getPersonalData(guest);
      return personalData?.language || "N/A";
    },
  },
  {
    key: "date_of_birth",
    label: "Date of Birth",
    icon: Calendar,
    accessor: (guest: GuestWithPersonalData) => {
      const personalData = getPersonalData(guest);
      return personalData?.date_of_birth
        ? new Date(personalData.date_of_birth).toLocaleDateString()
        : "N/A";
    },
  },
  {
    key: "is_active",
    label: "Status",
    accessor: (guest: GuestWithPersonalData) => (
      <StatusBadge
        status={guest.is_active ? "active" : "inactive"}
        label={guest.is_active ? "Active" : "Inactive"}
      />
    ),
  },
  {
    key: "dnd_status",
    label: "Do Not Disturb",
    accessor: (guest: GuestWithPersonalData) => (
      <StatusBadge
        status={guest.dnd_status ? "active" : "inactive"}
        label={guest.dnd_status ? "Yes" : "No"}
      />
    ),
  },
  {
    key: "created_at",
    label: "Checked In",
    icon: Calendar,
    accessor: (guest: GuestWithPersonalData) => {
      if (!guest.created_at) return "N/A";
      return new Date(guest.created_at).toLocaleString();
    },
  },
  {
    key: "access_code_expires_at",
    label: "Access Code Expires",
    icon: Calendar,
    accessor: (guest: GuestWithPersonalData) => {
      if (!guest.access_code_expires_at) return "N/A";
      return new Date(guest.access_code_expires_at).toLocaleString();
    },
  },
];
