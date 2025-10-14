import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import {
  useCalendar,
  CalendarView,
} from "../../../../../hooks/features/useCalendar";

interface CalendarProps {
  initialDate?: Date;
  schedules?: Record<string, string[]>; // Date string as key, schedules as value
  onDateSelect?: (date: Date) => void;
}

export const Calendar = ({
  initialDate,
  schedules,
  onDateSelect,
}: CalendarProps) => {
  const calendar = useCalendar(initialDate);

  const handleDateClick = (date: Date) => {
    calendar.setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleViewChange = (view: CalendarView) => {
    calendar.setView(view);
  };

  return (
    <div className="w-full">
      <CalendarHeader
        currentDate={calendar.currentDate}
        view={calendar.view}
        onPrevious={calendar.navigatePrevious}
        onNext={calendar.navigateNext}
        onToday={calendar.navigateToday}
        onViewChange={handleViewChange}
      />

      <CalendarGrid
        currentDate={calendar.currentDate}
        selectedDate={calendar.selectedDate}
        view={calendar.view}
        onDateClick={handleDateClick}
        schedules={schedules}
      />
    </div>
  );
};
