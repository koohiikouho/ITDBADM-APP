import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbars/navbar";
import { UserNavbar } from "@/components/navbars/usernavbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <div className="z-50">
        <UserNavbar />
      </div>

      {children}
    </div>
  );
}
