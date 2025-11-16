import { useState, useEffect } from "react";
import BandAvailability from "./BandAvailability";
import OfferForm from "./BandBooker";
import { apiClient } from "@/lib/api";

interface ScheduleData {
  schedule: {
    friday: number;
    monday: number;
    sunday: number;
    tuesday: number;
    saturday: number;
    thursday: number;
    vacation: number;
    wednesday: number;
  };
}

interface BandBookBodyProps {
  bandId?: string;
}

const BandBookBody: React.FC<BandBookBodyProps> = ({ bandId }) => {
  const [unavailableDays, setUnavailableDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bandName, setBandName] = useState("Band");
  const [isOnVacation, setIsOnVacation] = useState(false);

  // Convert schedule data to unavailable days array
  const getUnavailableDaysFromSchedule = (
    schedule: ScheduleData["schedule"]
  ): { unavailableDays: string[]; isOnVacation: boolean } => {
    const unavailable: string[] = [];

    // Days where value is 0 are unavailable
    if (schedule.monday === 0) unavailable.push("monday");
    if (schedule.tuesday === 0) unavailable.push("tuesday");
    if (schedule.wednesday === 0) unavailable.push("wednesday");
    if (schedule.thursday === 0) unavailable.push("thursday");
    if (schedule.friday === 0) unavailable.push("friday");
    if (schedule.saturday === 0) unavailable.push("saturday");
    if (schedule.sunday === 0) unavailable.push("sunday");

    // Check if band is on vacation (vacation === 1 means on vacation)
    const vacationMode = schedule.vacation === 1;
    if (vacationMode) {
      unavailable.push("vacation");
    }

    return { unavailableDays: unavailable, isOnVacation: vacationMode };
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!bandId) {
          throw new Error("No band ID provided");
        }

        console.log(
          "Fetching schedule from:",
          apiClient.baseURL + `/bands/schedule/${bandId}`
        );

        const response = await fetch(
          apiClient.baseURL + `/bands/schedule/${bandId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch schedule: ${response.status}`);
        }

        const data: ScheduleData[] = await response.json();
        console.log("Schedule API Response:", data);

        if (data && data.length > 0 && data[0].schedule) {
          const { unavailableDays, isOnVacation } =
            getUnavailableDaysFromSchedule(data[0].schedule);
          setUnavailableDays(unavailableDays);
          setIsOnVacation(isOnVacation);
          console.log("Unavailable days:", unavailableDays);
          console.log("Is on vacation:", isOnVacation);
        } else {
          throw new Error("No schedule data found");
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching schedule"
        );
      } finally {
        setLoading(false);
      }
    };

    if (bandId) {
      fetchSchedule();
    } else {
      setLoading(false);
    }
  }, [bandId]);

  // Add debug output to see what's being passed
  console.log("Passing unavailableDays to BandAvailability:", unavailableDays);
  console.log("Is band on vacation:", isOnVacation);

  if (loading) {
    return (
      <div className="flex flex-row justify-center items-start gap-8">
        <div className="max-w-lg p-4 text-center">
          <div className="text-lg">Loading schedule...</div>
        </div>
        <div className="max-w-lg p-4 text-center">
          <div className="text-lg">Loading booking form...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-row justify-center items-start gap-8">
        <div className="max-w-lg p-4 text-center text-red-500">
          <div className="text-lg">Error loading schedule</div>
          <div className="text-sm">{error}</div>
        </div>
        <div className="max-w-lg p-4 text-center">
          <div className="text-lg">Booking form unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-center items-start gap-8">
      <BandAvailability
        className="max-w-lg"
        unavailableDays={unavailableDays}
        isOnVacation={isOnVacation}
      />

      {/* Only show booking form if band is NOT on vacation */}
      {!isOnVacation ? (
        <OfferForm className="max-w-lg" bandName={bandName} currency="JPY" />
      ) : (
        <div className="max-w-lg p-6 text-center border border-yellow-300 bg-yellow-50 rounded-lg">
          <div className="text-xl font-semibold text-yellow-800 mb-2">
            🏖️ On Vacation
          </div>
          <div className="text-yellow-700">
            This band is currently on vacation and not accepting bookings.
            Please check back later!
          </div>
        </div>
      )}
    </div>
  );
};

export default BandBookBody;
