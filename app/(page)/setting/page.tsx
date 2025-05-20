import MainLayout from "@/components/layout/MainLayout";

const SettingPage = () => {
  return (
    <MainLayout>
      <div className="tab-content active">
        <div className="p-6 flex justify-between">
          <h4 className="mb-0 font-bold text-foreground">Settings</h4>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingPage;
