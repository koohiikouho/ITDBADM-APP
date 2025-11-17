// usernavbar.tsx
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
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

import { siteConfig } from "@/config/user";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  CartIcon,
  HeartFilledIcon,
  SearchIcon,
  UserIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  LogoutIcon,
  GlobeIcon,
  CurrencyDollarIcon,
} from "@/components/icons";
import { Logo } from "@/components/icons";
import { apiClient } from "@/lib/api";
import { Navigate, useNavigate } from "react-router-dom";
import { HeartIcon } from "lucide-react";

// Types for branch and currency
interface Branch {
  branch_id: number;
  branch_name: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const UserNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "",
    username: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Branch and Currency state
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const navigate = useNavigate();

  // Specific currencies as requested
  const availableCurrencies: Currency[] = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  ];

  useEffect(() => {
    checkAuthStatus();
    initializeBranchAndCurrency();
    fetchBranches();

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Fetch branches from API
  const fetchBranches = async () => {
    try {
      setBranchesLoading(true);
      const response = await fetch("http://localhost:3000/branch/");

      if (!response.ok) {
        throw new Error(`Failed to fetch branches: ${response.statusText}`);
      }

      const branchesData = await response.json();
      setBranches(branchesData);

      // Set default branch if not already set
      if (branchesData.length > 0 && !localStorage.getItem("selectedBranch")) {
        const defaultBranch = branchesData[0].branch_id.toString();
        setSelectedBranch(defaultBranch);
        localStorage.setItem("selectedBranch", defaultBranch);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      // Fallback to empty branches array
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  };

  // Initialize branch and currency from localStorage or set defaults
  const initializeBranchAndCurrency = () => {
    // Set currencies
    setCurrencies(availableCurrencies);

    // Get saved preferences from localStorage
    const savedBranch = localStorage.getItem("selectedBranch");
    const savedCurrency = localStorage.getItem("selectedCurrency");

    if (savedBranch) {
      setSelectedBranch(savedBranch);
    } else {
      // Will be set after branches are fetched
      setSelectedBranch("");
    }

    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    } else {
      // Set default currency to JPY
      const defaultCurrency = "JPY";
      setSelectedCurrency(defaultCurrency);
      localStorage.setItem("selectedCurrency", defaultCurrency);
    }
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        const response = await fetch(apiClient.baseURL + `/users/username`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();

          setIsLoggedIn(true);
          setUser({
            name: userData.username,
            username: userData.username,
            avatar: "",
          });
        } else if (response.status === 401) {
          // Token is invalid or expired
          handleLogout();
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        handleLogout();
      }
    } else {
      setIsLoggedIn(false);
      setUser({
        name: "",
        username: "",
        avatar: "",
      });
    }
    setIsLoading(false);
  };

  // Handle branch change
  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    localStorage.setItem("selectedBranch", branchId);
  };

  // Handle currency change
  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem("selectedCurrency", currencyCode);
  };

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUser({
      name: "",
      username: "",
      avatar: "",
    });
    navigate("/");
  };

  // Get current branch and currency display names
  const getCurrentBranchName = () => {
    if (branchesLoading) return "Loading...";
    const branch = branches.find(
      (b) => b.branch_id.toString() === selectedBranch
    );
    return branch ? branch.branch_name : "Select Branch";
  };

  const getCurrentCurrencyName = () => {
    const currency = currencies.find((c) => c.code === selectedCurrency);
    return currency ? currency.code : "JPY";
  };

  // Show loading state briefly
  if (isLoading) {
    return (
      <HeroUINavbar maxWidth="xl" position="sticky">
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand className="gap-3 max-w-fit">
            <Link
              className="flex justify-start items-center gap-1"
              color="foreground"
              href="/"
            >
              <Logo />
              <p className="font-bold text-inherit">Band N Brand</p>
            </Link>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent
          className="sm:flex basis-1/5 sm:basis-full"
          justify="end"
        >
          <NavbarItem className="hidden sm:flex gap-2">
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>
    );
  }

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
            <p className="font-bold text-inherit">Band N Brand</p>
          </Link>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
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

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {/* Branch Selector */}
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
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleBranchChange(selected);
              }}
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

        {/* Currency Selector */}
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
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleCurrencyChange(selected);
              }}
            >
              {currencies.map((currency) => (
                <DropdownItem key={currency.code}>
                  {currency.code} - {currency.name} ({currency.symbol})
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>

        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
          <Link href={siteConfig.links.cart} title="Cart">
            <CartIcon className="text-default-500" />
          </Link>
        </NavbarItem>

        <NavbarItem className="hidden md:flex">
          {isLoggedIn ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="flex items-center gap-2 text-sm font-normal text-default-600"
                >
                  <Avatar
                    size="sm"
                    name={user.name}
                    src={user.avatar}
                    classNames={{
                      base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
                      icon: "text-black/80",
                    }}
                  />
                  <span>Hi, {user.username}</span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu" variant="flat">
                <DropdownItem
                  key="profile"
                  href="/me"
                  startContent={<UserIcon className="w-4 h-4" />}
                >
                  Profile Settings
                </DropdownItem>
                <DropdownItem
                  key="orders"
                  href="/orders"
                  startContent={<DocumentTextIcon className="w-4 h-4" />}
                >
                  Orders
                </DropdownItem>
                <DropdownItem
                  key="offers"
                  href="/sent-offers"
                  startContent={<MusicalNoteIcon className="w-4 h-4" />}
                >
                  Offers
                </DropdownItem>
                <DropdownItem
                  key="likes"
                  href="/likes"
                  startContent={<HeartIcon className="w-4 h-4" />}
                >
                  Likes{" "}
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<LogoutIcon className="w-4 h-4" />}
                  onPress={handleLogout}
                >
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

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />

        {/* Mobile Branch Selector */}
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
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleBranchChange(selected);
              }}
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

        {/* Mobile Currency Selector */}
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
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleCurrencyChange(selected);
              }}
            >
              {currencies.map((currency) => (
                <DropdownItem key={currency.code}>{currency.code}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>

        {isLoggedIn ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button variant="light" isIconOnly>
                <Avatar
                  size="sm"
                  name={user.name}
                  src={user.avatar}
                  classNames={{
                    base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
                    icon: "text-black/80",
                  }}
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" variant="flat">
              <DropdownItem key="profile" href="/profile">
                Profile Settings
              </DropdownItem>
              <DropdownItem key="orders" href="/orders">
                Orders
              </DropdownItem>
              <DropdownItem key="offers" href="/offers">
                Offers
              </DropdownItem>
              <DropdownItem key="likes" href="/likes">
                Likes
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button
            as={Link}
            className="text-sm font-normal text-default-600"
            href="/login"
            variant="light"
          >
            Login
          </Button>
        )}
        <NavbarMenuToggle />
      </NavbarContent>
    </HeroUINavbar>
  );
};
