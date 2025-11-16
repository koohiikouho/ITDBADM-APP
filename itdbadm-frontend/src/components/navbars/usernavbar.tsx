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
} from "@/components/icons";
import { Logo } from "@/components/icons";
import { apiClient } from "@/lib/api";

export const UserNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "",
    username: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("authToken");

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
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUser({
      name: "",
      username: "",
      avatar: "",
    });
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

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          {isLoggedIn && (
            <>
              <NavbarMenuItem>
                <Link href="/profile" size="lg">
                  Profile Settings
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link href="/orders" size="lg">
                  Orders
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link href="/offers" size="lg">
                  Offers
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link color="danger" href="#" size="lg" onPress={handleLogout}>
                  Logout
                </Link>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
