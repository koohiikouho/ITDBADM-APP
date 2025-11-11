import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <div className="z-50">
        <Navbar />
      </div>

      {children}
    </div>
  );
}
