"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconUser } from "../icons/user";
import { IconMessage } from "../icons/message";
import { IconUsergroupAdd } from "../icons/usergroup-add";
import { IconContacts } from "../icons/contacts";
import { IconSetting } from "../icons/setting";
import { IconBxHomeAlt } from "../icons/bx-home-alt";
import { IconLogout } from "../icons/logout";
import { IconMoon } from "../icons/moon";
import { IconLock } from "../icons/lock";
import { SVGProps, ComponentType } from "react";

type NavItemProps = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const NAV_ITEMS = [
  { href: "/profile", label: "Profile", icon: IconUser },
  { href: "/", label: "Chats", icon: IconMessage },
  { href: "/room", label: "Groups", icon: IconUsergroupAdd },
  { href: "/contact", label: "Contacts", icon: IconContacts },
  { href: "/setting", label: "Settings", icon: IconSetting },
];

const SideBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const renderNavItem = ({ href, label, icon: Icon }: NavItemProps) => {
    const isActive = pathname === href;

    return (
      <li
        key={href}
        className={`flex-grow lg:flex-grow-0 ${isActive ? "active" : ""}`}
      >
        <Link
          href={href}
          className={`tab-button relative flex items-center justify-center mx-auto h-14 w-14 leading-[14px] group/tab my-1 rounded-lg ${
            isActive ? "bg-gray-200" : ""
          }`}
        >
          <div className="absolute items-center hidden -top-10 ltr:left-0 group-hover/tab:flex rtl:right-0">
            <div className="absolute -bottom-1 left-[40%] w-3 h-3 rotate-45 bg-black"></div>
            <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black rounded shadow-lg">
              {label}
            </span>
          </div>
          <Icon width={24} height={24} className="mx-auto cursor-pointer" />
        </Link>
      </li>
    );
  };

  const renderDropdownMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="relative w-40 lg:left-8">
        {[
          { label: "Profile", icon: IconUser },
          { label: "Setting", icon: IconSetting },
          { label: "Lock Screen", icon: IconLock },
        ].map(({ label, icon: Icon }) => (
          <DropdownMenuItem key={label} className="flex justify-between">
            <span>{label}</span>
            <Icon />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => router.push("/login")}
        >
          <span>Log out</span>
          <IconLogout />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="w-full lg:w-[75px] px-2 shadow lg:flex lg:flex-col flex flex-row justify-between items-center fixed lg:relative z-40 bottom-0 bg-white ">
      <div className="hidden lg:my-5 lg:block">
        <IconBxHomeAlt
          width={24}
          height={24}
          className="block dark:hidden cursor-pointer"
        />
        <IconBxHomeAlt
          width={24}
          height={24}
          className="hidden dark:block cursor-pointer"
        />
      </div>

      <div className="w-full mx-auto lg:my-auto">
        <ul
          id="tabs"
          className="flex flex-row justify-center w-full lg:flex-col lg:flex nav-tabs"
        >
          {NAV_ITEMS.map(renderNavItem)}
        </ul>
      </div>

      <div className="w-20 my-5 lg:w-auto">
        <ul className="lg:block">
          <li className="hidden text-center lg:block">
            <IconMoon
              width={24}
              height={24}
              className="mx-auto cursor-pointer"
            />
          </li>
          <li className="relative lg:mt-4 dropdown lg:dropup text-center">
            {renderDropdownMenu()}
          </li>
        </ul>
      </div>

     
    </div>
  );
};

export default SideBar;
