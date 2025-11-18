import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbars/navbar";
import { UserNavbar } from "@/components/navbars/usernavbar";

// export default function DefaultLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="relative flex flex-col h-screen">
//       <UserNavbar />
//       <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
//         {children}
//       </main>
//       <footer className="w-full flex items-center justify-center py-3">
//         <Link
//           isExternal
//           className="flex items-center gap-1 text-current"
//           href="https://heroui.com"
//           title="heroui.com homepage"
//         >
//           <span className="text-default-600">Made with ❤️</span>
//           <p className="text-primary">by Group 1</p>
//         </Link>
//       </footer>
//     </div>
//   );
// }

import { RoleBasedNavbar } from "@/components/navbars/roleBasedNavbar"; 

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <RoleBasedNavbar /> 
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      {/* ... footer ... */}
      <footer className="w-full flex items-center justify-center py-3">
//         <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://heroui.com"
          title="heroui.com homepage"
        >
          <span className="text-default-600">Made with ❤️</span>
          <p className="text-primary">by Group 1</p>
        </Link>
      </footer>
    </div>
  );
}
