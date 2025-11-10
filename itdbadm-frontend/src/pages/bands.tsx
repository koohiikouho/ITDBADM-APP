import { HeroUIProvider } from "@heroui/react";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import CardGrid from "@/components/cardgrid";

export default function DocsPage() {
  return (
    <HeroUIProvider>
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <div className="inline-block max-w-lg text-center justify-center">
            <h1 className={title()}>Bands</h1>
          </div>
        </section>
        <CardGrid />
      </DefaultLayout>
    </HeroUIProvider>
  );
}
