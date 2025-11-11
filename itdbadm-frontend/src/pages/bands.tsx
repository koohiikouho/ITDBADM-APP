import { HeroUIProvider } from "@heroui/react";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import CardGrid from "@/components/cardgrid";

export default function DocsPage() {
  return (
    <HeroUIProvider>
      <DefaultLayout>
        <CardGrid />
      </DefaultLayout>
    </HeroUIProvider>
  );
}
