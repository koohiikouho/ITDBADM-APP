import AnimatedContent from "@/components/AnimatedContent";
import BandInfoBody from "@/components/bandPageComponents/bandInfoBody";
import BandInfoHead from "@/components/bandPageComponents/bandInfoHead";
import DefaultLayout from "@/layouts/default";

export default function BandInfo() {
  return (
    <DefaultLayout>
      <div className="mx-30">
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
          <BandInfoHead isDescriptionOn />
        </AnimatedContent>

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
          <BandInfoBody />
        </AnimatedContent>
      </div>
    </DefaultLayout>
  );
}
