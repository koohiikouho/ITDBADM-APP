import BandAvailability from "./BandAvailability";
import OfferForm from "./BandBooker";

const BandBookBody: React.FC = () => {
  return (
    <div className="flex flex-row justify-center items-start gap-8">
      <BandAvailability
        className="max-w-lg"
        unavailableDays={["monday", "tuesday"]}
      />
      <OfferForm className="max-w-lg" bandName="Kessoku Band" currency="JPY" />
    </div>
  );
};

export default BandBookBody;
