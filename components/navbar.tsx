"use client"

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { useAuthStore } from "@/store/useAuthStore";
import logo from "../public/SpeaKico/logo SpeaKico.png";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo } from "react";


export const Navbar = () => {

  const { t } = useTranslation("nav");
  const { logout } = useAuthStore()

  const [hasCards, setHasCards] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const cards = localStorage.getItem("cards") || [];
      setHasCards(cards.length > 0);
    };

    handleStorageChange();

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const navItems = useMemo(() => {
    return siteConfig.navItems.filter((item) => {
      if (item.label === "nav.cards") {
        return hasCards;
      }
      return true;
    });
  }, [hasCards]);

  return (
    <HeroUINavbar
      height={80}
      maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Image src={logo} alt="SpeaKico" width={60} height={60} className="relative z-10" />
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {t(item.label)}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === navItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {t(item.label)}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <ThemeSwitch />
        <Button isIconOnly variant="ghost" onPress={logout}>
          <ArrowLeftEndOnRectangleIcon className="w-6 h-6" />
        </Button>
      </NavbarContent>
    </HeroUINavbar>
  );
};
