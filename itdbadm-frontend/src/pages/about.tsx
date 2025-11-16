import AboutPage from "@/components/About";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function DocsPage() {
  return (
    <DefaultLayout>
      <AboutPage />
    </DefaultLayout>
  );
}
