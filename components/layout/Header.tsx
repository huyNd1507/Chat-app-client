import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconSearch } from "../icons/search";
import { IconTelephone } from "../icons/phone";
import { IconVideoCamera } from "../icons/video-camera";
import { IconUsergroupAdd } from "../icons/usergroup-add";
import { IconEllipsis } from "../icons/ellipsis";
import { IconLeft } from "../icons/left";

const ICON_ACTIONS = [
  { icon: IconSearch, ariaLabel: "Search" },
  { icon: IconTelephone, ariaLabel: "Call" },
  { icon: IconVideoCamera, ariaLabel: "Video Call" },
  { icon: IconUsergroupAdd, ariaLabel: "Add Group" },
  { icon: IconEllipsis, ariaLabel: "More Options" },
];

interface ChatContentProps {
  isChatVisible: boolean;
  toggleChat: () => void;
}

const Header = ({ isChatVisible, toggleChat }: ChatContentProps) => {
  console.log("isChatVisible:", isChatVisible);
  return (
    <div className="p-4 border-b border-border lg:p-6">
      <div className="grid items-center grid-cols-12">
        {/* Left Section */}
        <div className="col-span-8 sm:col-span-4">
          <div className="flex items-center gap-2">
            <div
              className="block ltr:mr-2 rtl:ml-2 lg:hidden cursor-pointer"
              onClick={toggleChat}
            >
              <IconLeft />
            </div>
            <div className="rtl:ml-3 ltr:mr-3 relative">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="absolute w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full top-7 right-0"></span>
            </div>
            <div className="flex-grow overflow-hidden">
              <h5 className="mb-0 truncate text-16 ltr:block rtl:hidden font-semibold text-foreground">
                Quang Huy
              </h5>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-span-4 sm:col-span-8">
          <ul className="flex items-center justify-end gap-5">
            {ICON_ACTIONS.map(({ icon: Icon, ariaLabel }, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="text-xl text-muted-foreground border-0 btn lg:block hover:text-foreground transition-colors"
                  data-tw-toggle="modal"
                  data-tw-target="#audiCallModal"
                  aria-label={ariaLabel}
                >
                  <Icon />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
