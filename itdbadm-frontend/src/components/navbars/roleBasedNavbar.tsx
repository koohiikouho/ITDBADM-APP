// import { Button } from "@heroui/button";
// import { Link } from "@heroui/link";
// import {
//   Navbar as HeroUINavbar,
//   NavbarBrand,
//   NavbarContent,
//   NavbarItem,
//   NavbarMenuToggle,
//   NavbarMenu,
//   NavbarMenuItem,
// } from "@heroui/navbar";
// import {
//   Dropdown,
//   DropdownTrigger,
//   DropdownMenu,
//   DropdownItem,
// } from "@heroui/dropdown";
// import { Avatar } from "@heroui/avatar";
// import { link as linkStyles } from "@heroui/theme";
// import clsx from "clsx";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { ThemeSwitch } from "@/components/theme-switch";
// import {
//   CartIcon,
//   LogoutIcon,
//   Logo,
//   UserIcon,
//   DocumentTextIcon,
//   MusicalNoteIcon,
//   HeartFilledIcon,
//   SearchIcon
// } from "@/components/icons";
// import { JWTManager } from "@/lib/jwtUtils";
// import { apiClient } from "@/lib/api";
// import { Users, BarChart3, Package } from "lucide-react";

// interface UserState {
//   username: string;
//   role_id: number | null;
//   isAuthenticated: boolean;
// }

// export const RoleBasedNavbar = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState<UserState>({
//     username: "",
//     role_id: null, // 1: Admin, 2: Staff, 3: Customer, 4: BandManager
//     isAuthenticated: false,
//   });
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   // Check auth and role on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = JWTManager.getToken();

//       if (token && !JWTManager.isTokenExpired(token)) {
//         const payload = JWTManager.getTokenPayload(token);
        
//         try {
//             // Fetch username for display
//             const response = await fetch(apiClient.baseURL + `/users/username`, {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                 },
//             });
            
//             let username = "User";
//             if (response.ok) {
//                 const data = await response.json();
//                 username = data.username;
//             }

//             setUser({
//               username: username,
//               role_id: payload?.role_id || 3, // Default to 3 (Customer) if undefined
//               isAuthenticated: true,
//             });

//         } catch (error) {
//             console.error("Auth check failed", error);
//             handleLogout();
//         }
//       } else {
//         setUser({ username: "", role_id: null, isAuthenticated: false });
//       }
//     };

//     checkAuth();
    
//     // Listen for storage changes (login/logout in other tabs)
//     window.addEventListener("storage", checkAuth);
//     return () => window.removeEventListener("storage", checkAuth);
//   }, []);

//   const handleLogout = () => {
//     JWTManager.removeToken();
//     localStorage.removeItem("user");
//     setUser({ username: "", role_id: null, isAuthenticated: false });
//     navigate("/");
//   };

//   // --- Navigation Configuration ---

//   const customerLinks = [
//     { label: "Home", href: "/" },
//     { label: "Bands", href: "/bands" },
//     { label: "Merchandise", href: "/merchandise" },
//     { label: "About", href: "/about" },
//   ];

//   const bandManagerLinks = [
//     { label: "Dashboard", href: "/bandmanager/dashboard" },
//     { label: "Manage Band", href: "/bandmanager/edit-band" },
//     { label: "View Orders", href: "/bandmanager/analytics" }, 
//     { label: "Booking Offers", href: "/bandmanager/schedule" }, 
//   ];

//   const adminLinks = [
//     { label: "Analytics", href: "/bandmanager/analytics" }, // Reusing analytics page or point to specific admin one
//     { label: "Manage Users", href: "/admin/users" }, // You'll need to create this page
//     { label: "Manage Products", href: "/bandmanager/manage-products" }, // Reusing manage products or point to admin specific
//   ];

//   // Select links based on role
//   let navLinks = customerLinks; // Default to customer/guest
//   if (user.role_id === 4) navLinks = bandManagerLinks;
//   if (user.role_id === 1) navLinks = adminLinks;

//   // Helpers for conditional rendering
//   const isCustomer = user.role_id === 3 || user.role_id === null; // Guest is treated like customer for nav
//   const isManager = user.role_id === 4;
//   const isAdmin = user.role_id === 1;

//   return (
//     <HeroUINavbar 
//       maxWidth="xl" 
//       position="sticky" 
//       onMenuOpenChange={setIsMenuOpen}
//     >
//       {/* Left Content: Logo & Main Nav */}
//       <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
//         <NavbarBrand className="gap-3 max-w-fit">
//           <Link className="flex justify-start items-center gap-1" color="foreground" href="/">
//             <Logo />
//             <p className="font-bold text-inherit">Band N Brand</p>
//           </Link>
//         </NavbarBrand>
        
//         {/* Desktop Navigation Links */}
//         <div className="hidden lg:flex gap-4 justify-start ml-2">
//           {navLinks.map((item) => (
//             <NavbarItem key={item.href}>
//               <Link
//                 className={clsx(
//                   linkStyles({ color: "foreground" }),
//                   "data-[active=true]:text-primary data-[active=true]:font-medium"
//                 )}
//                 color="foreground"
//                 href={item.href}
//               >
//                 {item.label}
//               </Link>
//             </NavbarItem>
//           ))}
//         </div>
//       </NavbarContent>

//       {/* Right Content: Theme, Cart, Profile */}
//       <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
//         <NavbarItem className="hidden sm:flex gap-2">
//           <ThemeSwitch />
          
//           {/* Only show Cart for Customers (or Guests) */}
//           {isCustomer && (
//             <Link href="/cart" title="Cart">
//               <CartIcon className="text-default-500" />
//             </Link>
//           )}
//         </NavbarItem>

//         <NavbarItem className="hidden md:flex">
//           {user.isAuthenticated ? (
//             <Dropdown placement="bottom-end">
//               <DropdownTrigger>
//                 <Button
//                   variant="light"
//                   className="flex items-center gap-2 text-sm font-normal text-default-600"
//                 >
//                   <Avatar
//                     size="sm"
//                     name={user.username}
//                     classNames={{
//                       base: isAdmin 
//                         ? "bg-gradient-to-br from-red-500 to-orange-500"
//                         : isManager 
//                           ? "bg-gradient-to-br from-purple-500 to-indigo-500" 
//                           : "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
//                       icon: "text-white/90",
//                     }}
//                   />
//                   <span className="hidden lg:inline">
//                     {isAdmin ? `Admin: ${user.username}` : isManager ? `Manager: ${user.username}` : `Hi, ${user.username}`}
//                   </span>
//                 </Button>
//               </DropdownTrigger>
//               <DropdownMenu aria-label="User menu" variant="flat">
//                 {/* Common Profile Link */}
//                 <DropdownItem key="profile" href={isManager ? "/bandmanager/edit-band" : "/me"} startContent={<UserIcon className="w-4 h-4" />}>
//                   {isManager ? "Band Profile" : "Profile Settings"}
//                 </DropdownItem>
                
//                 {/* Customer Specific Items */}
//                 {isCustomer ? (
//                     <DropdownItem key="orders" href="/orders" startContent={<DocumentTextIcon className="w-4 h-4" />}>
//                       My Orders
//                     </DropdownItem>
//                 ) : null}
//                 {isCustomer ? (
//                     <DropdownItem key="offers" href="/sent-offers" startContent={<MusicalNoteIcon className="w-4 h-4" />}>
//                       My Offers
//                     </DropdownItem>
//                 ) : null }
//                 {isCustomer ? (
//                     <DropdownItem key="likes" href="/likes" startContent={<HeartFilledIcon className="w-4 h-4" />}>
//                       Liked Products
//                     </DropdownItem>
//                 ) : null}
                
//                 {/* Manager Specific Items */}
//                 {isManager ? (
//                   <DropdownItem key="products" href="/bandmanager/manage-products" startContent={<Package className="w-4 h-4" />}>
//                     Manage Products
//                   </DropdownItem>
//                 ) : null}

//                 {/* Admin Specific Items */}
//                 {isAdmin ? (
//                   <DropdownItem key="analytics" href="/bandmanager/analytics" startContent={<BarChart3 className="w-4 h-4" />}>
//                     Analytics
//                   </DropdownItem>
//                 ) : null}
//                  {isAdmin ? (
//                   <DropdownItem key="users" href="/admin/users" startContent={<Users className="w-4 h-4" />}>
//                     All Users
//                   </DropdownItem>
//                 ) : null}

//                 <DropdownItem key="logout" color="danger" startContent={<LogoutIcon className="w-4 h-4" />} onPress={handleLogout}>
//                   Logout
//                 </DropdownItem>
//               </DropdownMenu>
//             </Dropdown>
//           ) : (
//             <Button
//               as={Link}
//               className="text-sm font-normal text-default-600 bg-default-100"
//               href="/login"
//               variant="ghost"
//             >
//               Login
//             </Button>
//           )}
//         </NavbarItem>
//       </NavbarContent>

//       {/* Mobile Menu Toggle */}
//       <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
//         <ThemeSwitch />
//         {isCustomer && (
//            <Link href="/cart" className="mr-2">
//              <CartIcon className="text-default-500" size={20} />
//            </Link>
//         )}
//         <NavbarMenuToggle />
//       </NavbarContent>

//       {/* Mobile Menu Content */}
//       <NavbarMenu>
//         <div className="mx-4 mt-2 flex flex-col gap-2">
//           {navLinks.map((item, index) => (
//             <NavbarMenuItem key={`${item}-${index}`}>
//               <Link
//                 color="foreground"
//                 href={item.href}
//                 size="lg"
//                 className="w-full"
//               >
//                 {item.label}
//               </Link>
//             </NavbarMenuItem>
//           ))}
          
//           <div className="my-2 border-t border-default-200/50" />
          
//           {user.isAuthenticated ? (
//             <>
//               <NavbarMenuItem>
//                 <Link href={isManager ? "/bandmanager/edit-band" : "/me"} size="lg" color="secondary">
//                    {isManager ? "Band Profile" : "Profile Settings"}
//                 </Link>
//               </NavbarMenuItem>
              
//               {isCustomer && (
//                   <>
//                     <NavbarMenuItem>
//                         <Link href="/orders" size="lg" color="foreground">My Orders</Link>
//                     </NavbarMenuItem>
//                     <NavbarMenuItem>
//                         <Link href="/sent-offers" size="lg" color="foreground">My Offers</Link>
//                     </NavbarMenuItem>
//                     <NavbarMenuItem>
//                         <Link href="/likes" size="lg" color="foreground">Liked Products</Link>
//                     </NavbarMenuItem>
//                   </>
//               )}

//               <NavbarMenuItem>
//                 <Link color="danger" href="#" size="lg" onPress={handleLogout}>
//                   Logout
//                 </Link>
//               </NavbarMenuItem>
//             </>
//           ) : (
//             <NavbarMenuItem>
//               <Link href="/login" size="lg" color="primary">
//                 Login
//               </Link>
//             </NavbarMenuItem>
//           )}
//         </div>
//       </NavbarMenu>
//     </HeroUINavbar>
//   );
// };

import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ThemeSwitch } from "@/components/theme-switch";
import {
  CartIcon,
  LogoutIcon,
  Logo,
  UserIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  HeartFilledIcon,
  GlobeIcon,
  CurrencyDollarIcon,
} from "@/components/icons";
import { JWTManager } from "@/lib/jwtUtils";
import { apiClient } from "@/lib/api";
import { Users, BarChart3, Package } from "lucide-react";

// --- Types ---
interface UserState {
  username: string;
  role_id: number | null;
  isAuthenticated: boolean;
}

interface Branch {
  branch_id: number;
  branch_name: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// --- Constants ---
const availableCurrencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
];

export const RoleBasedNavbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserState>({
    username: "",
    role_id: null, // 1: Admin, 2: Staff, 3: Customer, 4: BandManager
    isAuthenticated: false,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Branch & Currency State
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>(availableCurrencies);
  const [branchesLoading, setBranchesLoading] = useState(true);

  // --- Initialization & Auth Check ---
  useEffect(() => {
    checkAuth();
    initializePreferences();
    fetchBranches();

    const handleStorageChange = (e: StorageEvent) => {
        // Refresh auth if token changes
        if (e.key === "accessToken" || e.key === null) checkAuth();
        // Refresh preferences if they change in another tab/component
        if (e.key === "selectedBranch" || e.key === "selectedCurrency") initializePreferences();
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const checkAuth = async () => {
    const token = JWTManager.getToken();

    if (token && !JWTManager.isTokenExpired(token)) {
      const payload = JWTManager.getTokenPayload(token);
      
      try {
          const response = await fetch(apiClient.baseURL + `/users/username`, {
              headers: { Authorization: `Bearer ${token}` },
          });
          
          let username = "User";
          if (response.ok) {
              const data = await response.json();
              username = data.username;
          }

          setUser({
            username: username,
            role_id: payload?.role_id || 3,
            isAuthenticated: true,
          });

      } catch (error) {
          console.error("Auth check failed", error);
          handleLogout();
      }
    } else {
      setUser({ username: "", role_id: null, isAuthenticated: false });
    }
  };

  const initializePreferences = () => {
    const savedBranch = localStorage.getItem("selectedBranch") || "";
    const savedCurrency = localStorage.getItem("selectedCurrency") || "JPY";
    
    setSelectedBranch(savedBranch);
    setSelectedCurrency(savedCurrency);
    
    if (!localStorage.getItem("selectedCurrency")) {
        localStorage.setItem("selectedCurrency", "JPY");
    }
  };

  const fetchBranches = async () => {
    try {
      setBranchesLoading(true);
      const response = await fetch(apiClient.baseURL + "/branch/");
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
        
        // Set default branch if none selected
        if (data.length > 0 && !localStorage.getItem("selectedBranch")) {
            const defaultBranch = data[0].branch_id.toString();
            setSelectedBranch(defaultBranch);
            localStorage.setItem("selectedBranch", defaultBranch);
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setBranchesLoading(false);
    }
  };

  // --- Handlers ---

  const handleLogout = () => {
    JWTManager.removeToken();
    localStorage.removeItem("user");
    setUser({ username: "", role_id: null, isAuthenticated: false });
    navigate("/");
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    localStorage.setItem("selectedBranch", branchId);
    // Dispatch event for other components to react immediately
    window.dispatchEvent(new Event("storage"));
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem("selectedCurrency", currencyCode);
    window.dispatchEvent(new Event("storage"));
  };

  // --- Helpers ---
  
  const getCurrentBranchName = () => {
    if (branchesLoading) return "Loading...";
    const branch = branches.find((b) => b.branch_id.toString() === selectedBranch);
    return branch ? branch.branch_name : "Select Branch";
  };

  const getCurrentCurrencyName = () => {
    const currency = currencies.find((c) => c.code === selectedCurrency);
    return currency ? currency.code : "JPY";
  };

  // --- Nav Configurations ---

  const customerLinks = [
    { label: "Home", href: "/" },
    { label: "Bands", href: "/bands" },
    { label: "Merchandise", href: "/merchandise" },
    { label: "About", href: "/about" },
  ];

  const bandManagerLinks = [
    { label: "Dashboard", href: "/bandmanager/dashboard" },
    { label: "Manage Band", href: "/bandmanager/edit-band" },
    { label: "View Orders", href: "/bandmanager/analytics" }, 
    { label: "Booking Offers", href: "/bandmanager/schedule" }, 
  ];

  const adminLinks = [
    { label: "Analytics", href: "/bandmanager/analytics" },
    { label: "Manage Users", href: "/admin/users" },
    { label: "Manage Products", href: "/bandmanager/manage-products" },
  ];

  let navLinks = customerLinks;
  if (user.role_id === 4) navLinks = bandManagerLinks;
  if (user.role_id === 1) navLinks = adminLinks;

  const isCustomer = user.role_id === 3 || user.role_id === null;
  const isManager = user.role_id === 4;
  const isAdmin = user.role_id === 1;

  return (
    <HeroUINavbar 
      maxWidth="xl" 
      position="sticky" 
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* --- LEFT: Logo & Main Links --- */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link className="flex justify-start items-center gap-1" color="foreground" href="/">
            <Logo />
            <p className="font-bold text-inherit">Band N Brand</p>
          </Link>
        </NavbarBrand>
        
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {navLinks.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* --- RIGHT (Desktop): Preferences, Cart, Profile --- */}
      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        
        {/* Branch & Currency Selectors (Only for Customers) */}
        {isCustomer && (
          <>
            <NavbarItem className="hidden md:flex">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="light"
                    className="flex items-center gap-2 text-sm font-normal text-default-600"
                    startContent={<GlobeIcon className="w-4 h-4" />}
                    isLoading={branchesLoading}
                  >
                    {getCurrentBranchName()}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Branch selection"
                  selectionMode="single"
                  selectedKeys={[selectedBranch]}
                  onSelectionChange={(keys) => handleBranchChange(Array.from(keys)[0] as string)}
                  isDisabled={branchesLoading || branches.length === 0}
                >
                  {branches.map((branch) => (
                    <DropdownItem key={branch.branch_id.toString()}>
                      {branch.branch_name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>

            <NavbarItem className="hidden md:flex">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="light"
                    className="flex items-center gap-2 text-sm font-normal text-default-600"
                    startContent={<CurrencyDollarIcon className="w-4 h-4" />}
                  >
                    {getCurrentCurrencyName()}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Currency selection"
                  selectionMode="single"
                  selectedKeys={[selectedCurrency]}
                  onSelectionChange={(keys) => handleCurrencyChange(Array.from(keys)[0] as string)}
                >
                  {currencies.map((currency) => (
                    <DropdownItem key={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        )}

        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
          
          {isCustomer && (
            <Link href="/cart" title="Cart">
              <CartIcon className="text-default-500" />
            </Link>
          )}
        </NavbarItem>

        <NavbarItem className="hidden md:flex">
          {user.isAuthenticated ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="flex items-center gap-2 text-sm font-normal text-default-600"
                >
                  <Avatar
                    size="sm"
                    name={user.username}
                    classNames={{
                      base: isAdmin 
                        ? "bg-gradient-to-br from-red-500 to-orange-500"
                        : isManager 
                          ? "bg-gradient-to-br from-purple-500 to-indigo-500" 
                          : "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
                      icon: "text-white/90",
                    }}
                  />
                  <span className="hidden lg:inline">
                    {isAdmin ? `Admin: ${user.username}` : isManager ? `Manager: ${user.username}` : `Hi, ${user.username}`}
                  </span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu" variant="flat">
                <DropdownItem key="profile" href={isManager ? "/bandmanager/edit-band" : "/me"} startContent={<UserIcon className="w-4 h-4" />}>
                  {isManager ? "Band Profile" : "Profile Settings"}
                </DropdownItem>
                
                {isCustomer ? (
                    <DropdownItem key="orders" href="/orders" startContent={<DocumentTextIcon className="w-4 h-4" />}>
                      My Orders
                    </DropdownItem>
                ) : null }
                {isCustomer ? (
                    <DropdownItem key="offers" href="/sent-offers" startContent={<MusicalNoteIcon className="w-4 h-4" />}>
                      My Offers
                    </DropdownItem>
                ) : null }
                {isCustomer ? (
                    <DropdownItem key="likes" href="/likes" startContent={<HeartFilledIcon className="w-4 h-4" />}>
                      Liked Products
                    </DropdownItem>
                ) : null }
                
                {isManager ? (
                  <DropdownItem key="products" href="/bandmanager/manage-products" startContent={<Package className="w-4 h-4" />}>
                    Manage Products
                  </DropdownItem>
                ) : null }

                {isAdmin ? (
                  <DropdownItem key="analytics" href="/bandmanager/analytics" startContent={<BarChart3 className="w-4 h-4" />}>
                    Analytics
                  </DropdownItem>
                ) : null }
                 {isAdmin ? (
                  <DropdownItem key="users" href="/admin/users" startContent={<Users className="w-4 h-4" />}>
                    All Users
                  </DropdownItem>
                ) : null }

                <DropdownItem key="logout" color="danger" startContent={<LogoutIcon className="w-4 h-4" />} onPress={handleLogout}>
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button
              as={Link}
              className="text-sm font-normal text-default-600 bg-default-100"
              href="/login"
              variant="ghost"
            >
              Login
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      {/* --- RIGHT (Mobile): Preferences & Menu --- */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        
        {/* Mobile Branch & Currency (Customers Only) */}
        {isCustomer && (
          <>
            <NavbarItem className="sm:hidden">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" isIconOnly isLoading={branchesLoading}>
                    <GlobeIcon className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Branch selection"
                  selectionMode="single"
                  selectedKeys={[selectedBranch]}
                  onSelectionChange={(keys) => handleBranchChange(Array.from(keys)[0] as string)}
                  isDisabled={branchesLoading || branches.length === 0}
                >
                  {branches.map((branch) => (
                    <DropdownItem key={branch.branch_id.toString()}>
                      {branch.branch_name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>

            <NavbarItem className="sm:hidden">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" isIconOnly>
                    <CurrencyDollarIcon className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Currency selection"
                  selectionMode="single"
                  selectedKeys={[selectedCurrency]}
                  onSelectionChange={(keys) => handleCurrencyChange(Array.from(keys)[0] as string)}
                >
                  {currencies.map((currency) => (
                    <DropdownItem key={currency.code}>{currency.code}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        )}

        <ThemeSwitch />
        
        {isCustomer && (
           <Link href="/cart" className="mr-2">
             <CartIcon className="text-default-500" size={20} />
           </Link>
        )}
        
        <NavbarMenuToggle />
      </NavbarContent>

      {/* --- Mobile Menu Content --- */}
      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navLinks.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color="foreground"
                href={item.href}
                size="lg"
                className="w-full"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          
          <div className="my-2 border-t border-default-200/50" />
          
          {user.isAuthenticated ? (
            <>
              <NavbarMenuItem>
                <Link href={isManager ? "/bandmanager/edit-band" : "/me"} size="lg" color="secondary">
                   {isManager ? "Band Profile" : "Profile Settings"}
                </Link>
              </NavbarMenuItem>
              
              {isCustomer && (
                  <>
                    <NavbarMenuItem>
                        <Link href="/orders" size="lg" color="foreground">My Orders</Link>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                        <Link href="/sent-offers" size="lg" color="foreground">My Offers</Link>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                        <Link href="/likes" size="lg" color="foreground">Liked Products</Link>
                    </NavbarMenuItem>
                  </>
              )}

              {isAdmin && (
                 <>
                   <NavbarMenuItem>
                       <Link href="/bandmanager/analytics" size="lg" color="foreground">Analytics</Link>
                   </NavbarMenuItem>
                   <NavbarMenuItem>
                       <Link href="/admin/users" size="lg" color="foreground">Manage Users</Link>
                   </NavbarMenuItem>
                 </>
              )}

              <NavbarMenuItem>
                <Link color="danger" href="#" size="lg" onPress={handleLogout}>
                  Logout
                </Link>
              </NavbarMenuItem>
            </>
          ) : (
            <NavbarMenuItem>
              <Link href="/login" size="lg" color="primary">
                Login
              </Link>
            </NavbarMenuItem>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};