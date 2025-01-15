import { IconSearch } from "@/components/icons/search";
import { IconUsergroupAdd } from "@/components/icons/usergroup-add";
import MainLayout from "@/components/layout/MainLayout";

const ContactPage = () => {
  return (
    <MainLayout>
      <div className="lg:w-[390px] tab-content">
        <div className="p-6 flex justify-between">
          <h4 className="mb-0 text-gray-700 font-bold">Contacts</h4>
          <IconUsergroupAdd />
        </div>

        <div className="mx-6 px-2 my-6 h-[48px]  rounded-lg flex items-center gap-3 border-2">
          <IconSearch />
          <input
            placeholder="Search messages or users"
            className="border-none outline-none focus:outline-none bg-transparent flex-grow h-full"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
