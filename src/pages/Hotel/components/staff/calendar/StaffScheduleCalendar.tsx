import { useState } from "react";
import { Calendar } from "./Calendar";

// Sample data - in a real app, this would come from an API
const sampleSchedules: Record<string, string[]> = {
  "2025-10-09": ["John D. - Morning Shift", "Sarah M. - Evening Shift"],
  "2025-10-10": ["Mike R. - Night Shift", "Lisa K. - Morning Shift"],
  "2025-10-11": ["Tom B. - Evening Shift"],
  "2025-10-12": [
    "Anna L. - Morning Shift",
    "Chris P. - Evening Shift",
    "Mark T. - Night Shift",
  ],
  "2025-10-13": ["Emma W. - Morning Shift"],
  "2025-10-14": ["David H. - Evening Shift", "Sophie R. - Night Shift"],
  "2025-10-15": ["Alex C. - Morning Shift", "Nina F. - Evening Shift"],
};

export const StaffScheduleCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const getSchedulesForDate = (date: Date): string[] => {
    const dateKey = date.toISOString().split("T")[0];
    return sampleSchedules[dateKey] || [];
  };

  return (
    <div className="space-y-6">
      <Calendar
        initialDate={new Date()}
        schedules={sampleSchedules}
        onDateSelect={handleDateSelect}
      />

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

          {getSchedulesForDate(selectedDate).length > 0 ? (
            <div className="space-y-3">
              {getSchedulesForDate(selectedDate).map((schedule, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {schedule}
                  </span>
                  <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                    Staff
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No staff scheduled for this date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
