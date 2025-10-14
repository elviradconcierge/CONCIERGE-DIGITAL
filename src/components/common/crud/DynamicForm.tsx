import React from "react";
import { DynamicFormField } from "./DynamicFormField";
import {
  FormFieldConfig,
  CRUDFormState,
  CRUDFormActions,
} from "../../../hooks";

interface DynamicFormProps {
  fields: FormFieldConfig[];
  formState: CRUDFormState;
  formActions: CRUDFormActions;
  disabled?: boolean;
  className?: string;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  formState,
  formActions,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {fields.map((field) => {
        const fieldValue = formState.formData[field.key];
        return (
          <DynamicFormField
            key={field.key}
            field={field}
            value={fieldValue}
            onChange={(value) => formActions.updateField(field.key, value)}
            error={formState.formErrors[field.key]}
            disabled={disabled || formState.isSubmitting}
          />
        );
      })}
      {formState.formErrors.general && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {formState.formErrors.general}
        </div>
      )}
    </div>
  );
};
