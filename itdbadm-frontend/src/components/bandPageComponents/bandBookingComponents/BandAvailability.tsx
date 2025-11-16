import React from "react";
import { Card, CardBody, CardHeader, Badge, cn } from "@heroui/react";
import { Calendar, X, Check } from "lucide-react";

interface BandAvailabilityProps {
  unavailableDays?: string[];
  className?: string;
  variant?: "simple" | "calendar";
  isOnVacation?: boolean;
}

const BandAvailability: React.FC<BandAvailabilityProps> = ({
  unavailableDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ],
  className,
  variant = "simple",
  isOnVacation = false,
}) => {
  const daysOfWeek = [
    { key: "monday", label: "Mon", fullLabel: "Monday" },
    { key: "tuesday", label: "Tue", fullLabel: "Tuesday" },
    { key: "wednesday", label: "Wed", fullLabel: "Wednesday" },
    { key: "thursday", label: "Thu", fullLabel: "Thursday" },
    { key: "friday", label: "Fri", fullLabel: "Friday" },
    { key: "saturday", label: "Sat", fullLabel: "Saturday" },
    { key: "sunday", label: "Sun", fullLabel: "Sunday" },
  ];

  const isUnavailable = (dayKey: string) => {
    return unavailableDays.includes(dayKey.toLowerCase());
  };

  const allDaysUnavailable = unavailableDays.length === 7;
  const availableDays = 7 - unavailableDays.length;

  if (variant === "calendar") {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-0">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-default-500" />
            <h3 className="text-lg font-semibold">Weekly Availability</h3>
          </div>
          <Badge
            color={
              allDaysUnavailable
                ? "danger"
                : availableDays > 3
                  ? "success"
                  : "warning"
            }
            variant="flat"
          >
            {availableDays} days free
          </Badge>
        </CardHeader>

        <CardBody>
          {allDaysUnavailable ? (
            <div className="text-center py-6">
              <X size={40} className="mx-auto text-danger mb-3" />
              <p className="text-danger font-semibold text-lg">
                Completely Booked
              </p>
              <p className="text-default-500">No availability this week</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {daysOfWeek.map((day) => (
                <div
                  key={day.key}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg border-2 transition-all",
                    isUnavailable(day.key)
                      ? "bg-danger-50 border-danger-300 text-danger-700 dark:bg-danger-950 dark:border-danger-700 dark:text-danger-300"
                      : "bg-success-50 border-success-300 text-success-700 dark:bg-success-950 dark:border-success-700 dark:text-success-300"
                  )}
                >
                  <span className="text-xs font-semibold mb-1">
                    {day.label}
                  </span>
                  {isUnavailable(day.key) ? (
                    <X size={16} className="text-danger" />
                  ) : (
                    <Check size={16} className="text-success" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-default-500" />
          <h3 className="text-lg font-semibold">Band Schedule</h3>
        </div>
        <Badge color={allDaysUnavailable ? "danger" : "warning"} variant="flat">
          {allDaysUnavailable
            ? "Unavailable"
            : `${unavailableDays.length} days busy`}
        </Badge>
      </CardHeader>

      <CardBody>
        <div className="space-y-3">
          {daysOfWeek.map((day) => (
            <div
              key={day.key}
              className="flex items-center justify-between p-2"
            >
              <span className="font-medium text-default-700">
                {day.fullLabel}
              </span>
              <Badge
                color={isUnavailable(day.key) ? "danger" : "success"}
                variant="flat"
                size="sm"
              >
                {isUnavailable(day.key) ? "Unavailable" : "Available"}
              </Badge>
            </div>
          ))}
        </div>

        {allDaysUnavailable && (
          <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg dark:bg-danger-950 dark:border-danger-800">
            <p className="text-danger-700 dark:text-danger-300 text-sm text-center">
              The band is completely booked this week. Please check back later
              for availability.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default BandAvailability;
