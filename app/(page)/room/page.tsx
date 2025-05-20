import { IconSearch } from "@/components/icons/search";
import { IconUsergroupAdd } from "@/components/icons/usergroup-add";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const RoomPage = () => {
  return (
    <MainLayout>
      <div>
        <div className="p-6 flex justify-between">
          <h4 className="mb-0 font-bold text-foreground">Groups</h4>

          <Dialog>
            <DialogTrigger>
              <IconUsergroupAdd />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="pb-3">Create New Group</DialogTitle>
                <Separator />
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mx-6 px-2 my-6 h-[48px]  rounded-lg flex items-center gap-3 border-2">
          <IconSearch />
          <input
            placeholder="Search messages or users"
            className="border-none outline-none focus:outline-none bg-transparent flex-grow h-full"
          />
        </div>

        <div className="p-6">
          <div className="flex px-4 items-center justify-between py-4 cursor-pointer hover:bg-accent transition-all ease-in-out border-b border-border rounded-md">
            <div className="flex items-center flex-1 gap-3">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="text-foreground">#Nhóm học tập</p>
            </div>
            <span className="w-5 h-5 bg-red-400 rounded-full float-right text-white text-xs flex items-center justify-center">
              1
            </span>
          </div>
          <div className="flex px-4 items-center justify-between py-4 cursor-pointer hover:bg-accent transition-all ease-in-out border-b border-border rounded-md">
            <div className="flex items-center flex-1 gap-3">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="text-foreground">#Developer</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RoomPage;
