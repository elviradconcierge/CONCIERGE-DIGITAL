import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../../../components/common/ui/Button";
import { CalendarView } from "../../../../../hooks/features/useCalendar";
import { formatMonthYear, formatWeekRange } from "../../../../../utils";

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}

export const CalendarHeader = ({
  currentDate,
  view,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
}: CalendarHeaderProps) => {
  const getTitle = () => {
    return view === "month"
      ? formatMonthYear(currentDate)
      : formatWeekRange(currentDate);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold text-gray-900">{getTitle()}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="text-sm"
        >
          Today
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewChange("month")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              view === "month"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => onViewChange("week")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              view === "week"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Week
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onNext} className="p-2">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
