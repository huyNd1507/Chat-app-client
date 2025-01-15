import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";

const ProfilePage = () => {
  return (
    <MainLayout>
      <div className="lg:w-[390px]">
        <div className="p-6">
          <h4 className="mb-0 text-gray-700 font-bold">My Profile</h4>
          <Avatar className="w-[90px] h-[90px] mx-auto border-2 border-gray-400 mt-6">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h4 className="mb-0 text-gray-700 font-bold pt-3 text-center">
            Quang Huy
          </h4>
        </div>

        <Separator />

        <div className="p-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className="border-none ">
              <AccordionTrigger className="border-[1px] p-3 rounded-tl-md rounded-tr-md hover:no-underline">
                About
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-6 bg-white px-3 py-6 border-l-[1px] border-r-[1px] border-b-[1px] rounded-bl-md rounded-br-md">
                <div>
                  <Label htmlFor="name" className="text-[#74788D]">
                    Name
                  </Label>
                  <h4 className="scroll-m-20 text-[16px]  font-[500] tracking-tight">
                    Trần Quang Huy
                  </h4>
                </div>
                <div>
                  <Label htmlFor="email" className="text-[#74788D]">
                    Email
                  </Label>
                  <h4 className="scroll-m-20 text-[16px]  font-[500] tracking-tight">
                    huytranquang.150701@gmail.com
                  </h4>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
