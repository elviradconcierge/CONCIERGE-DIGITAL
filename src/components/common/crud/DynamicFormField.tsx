import React from "react";
import { cn } from "../../../utils";
import { FormFieldConfig } from "../../../hooks";

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  className,
}) => {
  const baseInputClasses = cn(
    "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
    error
      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
    disabled && "bg-gray-50 cursor-not-allowed",
    className
  );

  const stringValue = (value ?? "") as string;

  const renderField = () => {
    switch (field.type) {
      case "select":
        return (
          <select
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={field.required}
            className={baseInputClasses}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            required={field.required}
            rows={4}
            className={cn(baseInputClasses, "resize-vertical")}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={stringValue}
            onChange={(e) => onChange(e.target.valueAsNumber || e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            required={field.required}
            className={baseInputClasses}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={field.required}
            className={baseInputClasses}
          />
        );

      default:
        return (
          <input
            type={field.type}
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            required={field.required}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
