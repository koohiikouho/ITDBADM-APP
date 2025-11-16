import AnimatedContent from "@/components/AnimatedContent";
import ProductGrid from "@/components/Merchandise";
import DefaultLayout from "@/layouts/default";

export default function MerchandisePage() {
  return (
    <DefaultLayout>
      <AnimatedContent
        distance={150}
        direction="horizontal"
        reverse={true}
        duration={0.3}
        ease="power3.out"
        initialOpacity={0.2}
        animateOpacity
        scale={1}
        threshold={0.2}
        delay={0.1}
      >
        <ProductGrid />
      </AnimatedContent>
    </DefaultLayout>
  );
}
