/**
 * Staff Form Component
 * Custom form with logic for position/department relationship
 */

import { useEffect } from "react";
import { DynamicForm } from "../../../../../components/common/crud";
import { CRUDFormState, CRUDFormActions } from "../../../../../hooks";
import { STAFF_FORM_FIELDS } from "./StaffFormFields";

interface StaffFormProps {
  formState: CRUDFormState;
  formActions: CRUDFormActions;
  disabled?: boolean;
}

export const StaffForm = ({
  formState,
  formActions,
  disabled = false,
}: StaffFormProps) => {
  // Watch for position changes and automatically set department
  useEffect(() => {
    const position = formState.formData.position as string;

    if (position === "Hotel Admin") {
      // Auto-set department to Manager for Hotel Admin
      if (formState.formData.department !== "Manager") {
        formActions.updateField("department", "Manager");
      }
    }
  }, [formState.formData.position, formState.formData.department, formActions]);

  // Filter department options based on position
  const getFilteredFields = () => {
    const position = formState.formData.position as string;

    return STAFF_FORM_FIELDS.map((field) => {
      if (field.key === "department") {
        if (position === "Hotel Admin") {
          // For Hotel Admin, only show Manager
          return {
            ...field,
            options: [{ value: "Manager", label: "Manager" }],
            disabled: true, // Disable since it's auto-selected
          };
        } else if (position === "Hotel Staff") {
          // For Hotel Staff, show all except Manager
          return {
            ...field,
            options: field.options?.filter((opt) => opt.value !== "Manager"),
          };
        }
      }
      return field;
    });
  };

  return (
    <DynamicForm
      fields={getFilteredFields()}
      formState={formState}
      formActions={formActions}
      disabled={disabled}
    />
  );
};
