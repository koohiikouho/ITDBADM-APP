import BandInfoHead from "@/components/bandPageComponents/bandInfoHead";
import DefaultLayout from "@/layouts/default";

export default function ProductPage() {
  return (
    <DefaultLayout>
      <div className="mx-30">
        <BandInfoHead isDescriptionOn={false} />
      </div>
    </DefaultLayout>
  );
}
