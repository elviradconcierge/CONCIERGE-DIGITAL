import { useState, useMemo } from "react";
import { FormModal } from "../../../../../components/common/ui/FormModal";
import { useHotelStaffWithPersonalData } from "../../../../../hooks/queries/hotel-management/staff";
import { useCreateStaffSchedule } from "../../../../../hooks/queries/hotel-management/staff/useStaffScheduleQueries";
import { useHotelStaff } from "../../../../../hooks/hotel/useHotelStaff";

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateScheduleModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateScheduleModalProps) => {
  const { hotelId, hotelStaff: currentStaff } = useHotelStaff();
  const { data: staffMembers = [] } = useHotelStaffWithPersonalData();
  const createSchedule = useCreateStaffSchedule();

  // Form state
  const [formData, setFormData] = useState({
    staff_id: "",
    schedule_start_date: "",
    schedule_finish_date: "",
    shift_start: "",
    shift_end: "",
    status: "SCHEDULED" as const,
    notes: "",
  });

  // Staff options for dropdown
  const staffOptions = useMemo(() => {
    return staffMembers.map((staff) => ({
      value: staff.id,
      label: `${staff.name} (${staff.employeeId})`,
    }));
  }, [staffMembers]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hotelId) {
      console.error("Hotel ID is required");
      return;
    }

    try {
      await createSchedule.mutateAsync({
        ...formData,
        hotel_id: hotelId,
        created_by: currentStaff?.id || null,
      });

      // Reset form
      setFormData({
        staff_id: "",
        schedule_start_date: "",
        schedule_finish_date: "",
        shift_start: "",
        shift_end: "",
        status: "SCHEDULED",
        notes: "",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to create schedule:", error);
    }
  };

  const inputClasses =
    "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create Schedule"
      submitText="Create Schedule"
      isLoading={createSchedule.isPending}
      size="lg"
    >
      <div className="space-y-4">
        {/* Staff Member Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Staff Member <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="staff_id"
            name="staff_id"
            value={formData.staff_id}
            onChange={handleInputChange}
            required
            className={inputClasses}
          >
            <option value="">Select staff member</option>
            {staffOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Start Date <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="schedule_start_date"
              name="schedule_start_date"
              type="date"
              value={formData.schedule_start_date}
              onChange={handleInputChange}
              required
              className={inputClasses}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Finish Date <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="schedule_finish_date"
              name="schedule_finish_date"
              type="date"
              value={formData.schedule_finish_date}
              onChange={handleInputChange}
              required
              className={inputClasses}
            />
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Shift Start Time <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="shift_start"
              name="shift_start"
              type="time"
              value={formData.shift_start}
              onChange={handleInputChange}
              required
              className={inputClasses}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Shift End Time <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="shift_end"
              name="shift_end"
              type="time"
              value={formData.shift_end}
              onChange={handleInputChange}
              required
              className={inputClasses}
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={inputClasses}
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add any notes or special instructions..."
            rows={3}
            maxLength={1000}
            className={`${inputClasses} resize-vertical`}
          />
          <p className="text-xs text-gray-500">
            {formData.notes.length}/1000 characters
          </p>
        </div>
      </div>
    </FormModal>
  );
};
