import AnimatedContent from "@/components/AnimatedContent";
import BandBookBody from "@/components/bandPageComponents/bandBookingComponents/BandBookBody";
import BandInfoHead from "@/components/bandPageComponents/bandInfoHead";
import DefaultLayout from "@/layouts/default";

export default function BookPage() {
  return (
    <DefaultLayout>
      <AnimatedContent
        distance={150}
        direction="vertical"
        reverse={false}
        duration={0.3}
        ease="power3.out"
        initialOpacity={0.2}
        animateOpacity
        scale={1}
        threshold={0.2}
        delay={0.1}
      >
        <div className="mx-30">
          <BandInfoHead isDescriptionOn={false} />
          <BandBookBody />
        </div>
      </AnimatedContent>
    </DefaultLayout>
  );
}
