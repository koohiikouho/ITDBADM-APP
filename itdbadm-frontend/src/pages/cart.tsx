import Checkout from "@/components/Checkout";
import DefaultLayout from "@/layouts/default";
import { HeroUIProvider } from "@heroui/system";

export default function CartPage() {
  return (
    <DefaultLayout>
      <HeroUIProvider>
        <Checkout />
      </HeroUIProvider>
    </DefaultLayout>
  );
}
