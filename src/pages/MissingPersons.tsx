import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EmergencyHeader } from "@/components/EmergencyHeader";
import { MissingPersonForm } from "@/components/MissingPersonForm";
import { MissingPersonsList } from "@/components/MissingPersonsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, List } from "lucide-react";

const MissingPersons = () => {
  const [activeTab, setActiveTab] = useState("list");

  const handleFormSuccess = () => {
    setActiveTab("list");
  };

  return (
    <AppShell>
      <EmergencyHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Missing Persons</h1>
          <p className="text-muted-foreground">
            Help locate missing persons by submitting reports or viewing existing cases
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              View Reports
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Report Missing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <MissingPersonsList />
          </TabsContent>

          <TabsContent value="report" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <MissingPersonForm onSuccess={handleFormSuccess} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default MissingPersons;