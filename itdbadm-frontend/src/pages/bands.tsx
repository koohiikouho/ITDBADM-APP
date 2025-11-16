import { HeroUIProvider } from "@heroui/react";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import CardGrid from "@/components/cardgrid";
import AnimatedContent from "@/components/AnimatedContent";

export default function DocsPage() {
  return (
    <HeroUIProvider>
      <DefaultLayout>
        <AnimatedContent
          distance={100}
          direction="horizontal"
          reverse={false}
          duration={0.3}
          ease="power3.out"
          initialOpacity={0.2}
          animateOpacity
          scale={1}
          threshold={0.2}
          delay={0.1}
        >
          <CardGrid />
        </AnimatedContent>
      </DefaultLayout>
    </HeroUIProvider>
  );
}
