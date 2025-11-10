import BandInfoBody from "@/components/bandPageComponents/bandInfoBody";
import BandInfoHead from "@/components/bandPageComponents/bandInfoHead";
import DefaultLayout from "@/layouts/default";

export default function BandInfo() {
  return (
    <DefaultLayout>
      <div className="mx-30">
        <BandInfoHead isDescriptionOn />
        <BandInfoBody />
      </div>
    </DefaultLayout>
  );
}
