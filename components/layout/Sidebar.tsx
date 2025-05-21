"use client";

import { useState } from "react";
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
import { useUser } from "@/contexts/UserContext";
import { ThemeToggle } from "../theme/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/contexts/SocketContext";

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
  const { user } = useUser();
  const { logout } = useAuth();
  const { isConnected } = useSocket();
  const [isChatVisible, setIsChatVisible] = useState(false);

  const renderNavItem = ({ href, label, icon: Icon }: NavItemProps) => {
    const isActive = pathname === href;

    return (
      <li
        key={href}
        className={`flex-grow lg:flex-grow-0 ${isActive ? "active" : ""}`}
      >
        <Link
          href={href}
          className={`tab-button relative flex items-center justify-center mx-auto h-14 w-14 leading-[14px] group/tab my-1 rounded-lg transition-colors ${
            isActive
              ? "bg-secondary text-secondary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <div className="absolute items-center hidden -top-10 ltr:left-0 group-hover/tab:flex rtl:right-0">
            <div className="absolute -bottom-1 left-[40%] w-3 h-3 rotate-45 bg-popover"></div>
            <span className="relative z-10 p-2 text-xs leading-none text-popover-foreground whitespace-no-wrap bg-popover rounded shadow-lg">
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
        <Avatar className="cursor-pointer relative">
          <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} />
          <AvatarFallback>{user?.fullname?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        {isConnected && (
          <span className="absolute w-3 h-3 bg-green-500 border-2 border-background rounded-full top-0 right-0 z-50"></span>
        )}
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
          className="flex justify-between cursor-pointer"
          onClick={() => logout()}
        >
          <span>Log out</span>
          <IconLogout />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="w-full lg:w-[75px] md:h-full  px-2 shadow lg:flex lg:flex-col flex flex-row justify-between items-center fixed lg:relative z-40 bottom-0 bg-background border-t lg:border-r lg:border-t-0 border-border">
      <div className="hidden lg:my-5 lg:block">
        <IconBxHomeAlt
          width={24}
          height={24}
          className="block cursor-pointer"
        />
        <IconBxHomeAlt
          width={24}
          height={24}
          className="hidden cursor-pointer"
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
            <ThemeToggle />
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
