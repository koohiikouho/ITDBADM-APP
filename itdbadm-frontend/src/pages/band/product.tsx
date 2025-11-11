import BandInfoHead from "@/components/bandPageComponents/bandInfoHead";
import DefaultLayout from "@/layouts/default";
import AnimatedContent from "@/components/AnimatedContent";
import ProductBody from "@/components/bandPageComponents/bandProduct";
import CompactProductGrid from "@/components/bandPageComponents/BandProductFooter";

export default function ProductPage() {
  return (
    <DefaultLayout>
      <AnimatedContent
        distance={150}
        direction="vertical"
        reverse={false}
        duration={0.5}
        ease="power3.out"
        initialOpacity={0.2}
        animateOpacity
        scale={1}
        threshold={0.2}
        delay={0.1}
      >
        <div className="mx-30">
          <BandInfoHead isDescriptionOn />
          <ProductBody />
          <div className="flex content-center flex-col items-center">
            <div className="font-bold mb-3">Other Kessoku Band Merch</div>
            <CompactProductGrid />
          </div>
        </div>
      </AnimatedContent>
      <br />
    </DefaultLayout>
  );
}
