/**
 * Guest Form Fields Configuration
 *
 * Defines form fields for creating and editing guests.
 */

import { FormFieldConfig } from "../../../../hooks";

export const GUEST_FORM_FIELDS: FormFieldConfig[] = [
  // Guest Basic Information
  {
    key: "guest_name",
    label: "Guest Name",
    type: "text" as const,
    required: true,
    placeholder: "Enter guest name",
  },
  {
    key: "room_number",
    label: "Room Number",
    type: "text" as const,
    required: true,
    placeholder: "Enter room number",
  },

  // Personal Information
  {
    key: "guest_personal_data.first_name",
    label: "First Name",
    type: "text" as const,
    required: false,
    placeholder: "Enter first name",
  },
  {
    key: "guest_personal_data.last_name",
    label: "Last Name",
    type: "text" as const,
    required: false,
    placeholder: "Enter last name",
  },
  {
    key: "guest_personal_data.guest_email",
    label: "Email",
    type: "email" as const,
    required: false,
    placeholder: "Enter email address",
  },
  {
    key: "guest_personal_data.phone_number",
    label: "Phone Number",
    type: "text" as const,
    required: false,
    placeholder: "Enter phone number",
  },
  {
    key: "guest_personal_data.date_of_birth",
    label: "Date of Birth",
    type: "date" as const,
    required: false,
  },
  {
    key: "guest_personal_data.country",
    label: "Country",
    type: "text" as const,
    required: false,
    placeholder: "Enter country",
  },
  {
    key: "guest_personal_data.language",
    label: "Language",
    type: "text" as const,
    required: false,
    placeholder: "Enter preferred language",
  },

  // Guest Status
  {
    key: "is_active",
    label: "Active",
    type: "select" as const,
    required: false,
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
  {
    key: "dnd_status",
    label: "Do Not Disturb",
    type: "select" as const,
    required: false,
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
];
