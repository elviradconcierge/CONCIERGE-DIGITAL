import { useState, useMemo } from "react";
import { Calendar } from "./Calendar";
import { CreateScheduleModal } from "./CreateScheduleModal";
import { useStaffSchedules } from "../../../../../hooks/queries/hotel-management/staff/useStaffScheduleQueries";
import { useHotelStaffWithPersonalData } from "../../../../../hooks/queries/hotel-management/staff";
import { useHotelStaff } from "../../../../../hooks/hotel/useHotelStaff";
import { useSendStaffCalendar } from "../../../../../hooks/queries/hotel-management/staff/useSendStaffCalendar";
import { useConfirmDialog } from "../../../../../hooks/ui/useConfirmDialog";
import { ConfirmationModal } from "../../../../../components/common/ui";
import { useToast } from "../../../../../hooks/ui";

export const StaffScheduleCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { hotelId } = useHotelStaff();
  const { toast } = useToast();
  const { mutate: sendCalendar, isPending: isSending } = useSendStaffCalendar();
  const { confirm, dialog } = useConfirmDialog();
  const successDialog = useConfirmDialog();
  const { data: schedules = [], isLoading } = useStaffSchedules(
    hotelId || undefined
  );
  const { data: staffMembers = [] } = useHotelStaffWithPersonalData();

  // Create a map of staff_id to staff name for quick lookup
  const staffNameMap = useMemo(() => {
    return staffMembers.reduce((acc, staff) => {
      acc[staff.id] = staff.name;
      return acc;
    }, {} as Record<string, string>);
  }, [staffMembers]);

  // Transform schedules for calendar display
  // Expand each schedule across its entire date range (start to finish)
  const schedulesByDate = useMemo(() => {
    const grouped: Record<string, string[]> = {};

    schedules.forEach((schedule) => {
      const staffName = staffNameMap[schedule.staff_id] || "Unknown Staff";
      const shiftTime = `${schedule.shift_start.substring(
        0,
        5
      )} - ${schedule.shift_end.substring(0, 5)}`;
      const displayText = `${staffName} - ${shiftTime}`;

      // Work directly with date strings to avoid timezone conversion issues
      const startDateStr = schedule.schedule_start_date; // YYYY-MM-DD
      const finishDateStr = schedule.schedule_finish_date; // YYYY-MM-DD

      // Parse the date strings manually
      const [startYear, startMonth, startDay] = startDateStr
        .split("-")
        .map(Number);
      const [finishYear, finishMonth, finishDay] = finishDateStr
        .split("-")
        .map(Number);

      const startDate = new Date(startYear, startMonth - 1, startDay);
      const finishDate = new Date(finishYear, finishMonth - 1, finishDay);

      // Add schedule to every date in the range
      const currentDate = new Date(startDate);
      while (currentDate <= finishDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(displayText);

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return grouped;
  }, [schedules, staffNameMap]);

  // Get schedules for selected date (including multi-day schedules)
  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return [];

    // Use local time to match the schedule date strings (avoid timezone shift)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    // Filter schedules where selected date falls within the range
    return schedules.filter((schedule) => {
      const startDate = schedule.schedule_start_date;
      const finishDate = schedule.schedule_finish_date;
      return dateKey >= startDate && dateKey <= finishDate;
    });
  }, [selectedDate, schedules]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSendCalendar = async () => {
    console.log("🎯 handleSendCalendar triggered");
    console.log("🏨 Current hotelId:", hotelId);

    if (!hotelId) {
      console.error("❌ No hotel ID available");
      toast({
        type: "error",
        message: "Hotel ID not found. Please try again.",
      });
      return;
    }

    console.log("📋 Showing confirmation dialog...");
    const confirmed = await confirm({
      title: "Send Calendar Emails",
      message: `This will send schedule emails to all active staff members with their upcoming shifts for the next 30 days. Do you want to continue?`,
      confirmText: "Send Emails",
      cancelText: "Cancel",
      variant: "info",
    });

    console.log("✅ User confirmation:", confirmed);

    if (confirmed) {
      console.log("🚀 Initiating calendar email send...");
      console.log("📤 Sending request with hotelId:", hotelId);

      sendCalendar(
        { hotelId },
        {
          onSuccess: async (data) => {
            console.log("====================================");
            console.log("🎉 CALENDAR EMAIL SUCCESS");
            console.log("====================================");
            console.log("📊 Full response data:", data);
            console.log("👥 Total staff:", data.totalStaff);
            console.log("✅ Successful emails:", data.successfulEmails);
            console.log("❌ Failed emails:", data.failedEmails);
            console.log("📧 Recipient:", data.recipient);
            console.log("📋 Email results:", data.emailResults);
            console.log("====================================");

            // Show success confirmation modal
            await successDialog.confirm({
              title: "Calendar Emails Sent Successfully!",
              message: `📧 ${data.successfulEmails} out of ${
                data.totalStaff
              } emails sent successfully${
                data.failedEmails > 0
                  ? `\n\n⚠️ ${data.failedEmails} email(s) failed to send. Please check the logs for details.`
                  : ""
              }`,
              confirmText: "OK",
              variant: "success",
            });

            toast({
              type: "success",
              message: `Calendar emails sent! ${data.successfulEmails}/${data.totalStaff} successful`,
            });
          },
          onError: (error) => {
            console.error("====================================");
            console.error("💥 CALENDAR EMAIL ERROR");
            console.error("====================================");
            console.error("Error object:", error);
            console.error("Error message:", error.message);
            console.error("Error name:", error.name);
            console.error("Error stack:", error.stack);
            console.error("====================================");

            toast({
              type: "error",
              message:
                error.message ||
                "Failed to send calendar emails. Please try again.",
            });
          },
        }
      );
    } else {
      console.log("❌ User cancelled the operation");
    }
  };

  const handleCreateSchedule = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    // Calendar will auto-refresh via React Query invalidation
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-500">Loading schedules...</p>
        </div>
      ) : (
        <Calendar
          initialDate={new Date()}
          schedules={schedulesByDate}
          onDateSelect={handleDateSelect}
          onSendCalendar={handleSendCalendar}
          onCreateSchedule={handleCreateSchedule}
        />
      )}

      {selectedDate && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Staff Schedule for{" "}
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>

          {selectedDateSchedules.length > 0 ? (
            <div className="space-y-3">
              {selectedDateSchedules.map((schedule) => {
                const staffName =
                  staffNameMap[schedule.staff_id] || "Unknown Staff";
                const shiftTime = `${schedule.shift_start.substring(
                  0,
                  5
                )} - ${schedule.shift_end.substring(0, 5)}`;

                return (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {staffName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {shiftTime}
                        </span>
                      </div>
                      {schedule.notes && (
                        <p className="mt-1 text-xs text-gray-600">
                          {schedule.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          schedule.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : schedule.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-700"
                            : schedule.status === "COMPLETED"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {schedule.status}
                      </span>
                      {schedule.is_confirmed && (
                        <span className="text-xs text-green-600">
                          ✓ Confirmed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No staff scheduled for this date</p>
            </div>
          )}
        </div>
      )}

      {/* Create Schedule Modal */}
      <CreateScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Confirmation Modal for Sending Calendar */}
      <ConfirmationModal {...dialog} isLoading={isSending} />

      {/* Success Confirmation Modal */}
      <ConfirmationModal {...successDialog.dialog} />
    </div>
  );
};
