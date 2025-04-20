
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalTab from "./PersonalTab";
import CompanyTab from "./CompanyTab";
import TeamTab from "./TeamTab";
import ThemeTab from "./ThemeTab";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500">Manage your account and company settings</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="personal"><PersonalTab /></TabsContent>
        <TabsContent value="company"><CompanyTab /></TabsContent>
        <TabsContent value="team"><TeamTab /></TabsContent>
        <TabsContent value="theme"><ThemeTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
