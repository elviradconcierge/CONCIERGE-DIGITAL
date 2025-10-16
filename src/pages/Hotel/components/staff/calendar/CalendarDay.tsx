import { isSameDay, isSameMonth, isToday } from "../../../../../utils";

interface CalendarDayProps {
  date: Date;
  currentDate: Date;
  selectedDate: Date | null;
  onClick: (date: Date) => void;
  schedules?: string[]; // For displaying staff schedules
}

export const CalendarDay = ({
  date,
  currentDate,
  selectedDate,
  onClick,
  schedules = [],
}: CalendarDayProps) => {
  const isSelected = selectedDate && isSameDay(date, selectedDate);
  const isCurrentDay = isToday(date);
  const isInCurrentMonth = isSameMonth(date, currentDate);
  const hasSchedules = schedules.length > 0;

  const dayClassName = [
    "relative w-full h-20 p-2 border border-gray-200 cursor-pointer transition-colors",
    "hover:bg-gray-50",
    isSelected && "bg-blue-100 border-blue-300",
    isCurrentDay && "bg-blue-50 border-blue-200",
    !isInCurrentMonth && "text-gray-400 bg-gray-50",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={dayClassName} onClick={() => onClick(date)}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span
            className={`text-sm font-medium ${
              isCurrentDay
                ? "text-blue-600"
                : isInCurrentMonth
                ? "text-gray-900"
                : "text-gray-400"
            }`}
          >
            {date.getDate()}
          </span>
          {schedules.length > 2 && (
            <span className="text-xs text-gray-500 font-normal">
              +{schedules.length - 2}
            </span>
          )}
        </div>
        {hasSchedules && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>

      {hasSchedules && (
        <div className="space-y-1">
          {schedules.slice(0, 2).map((schedule, index) => (
            <div
              key={index}
              className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
            >
              {schedule}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
