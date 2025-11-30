import { AppShell } from "@/components/layout/AppShell";
import { EmergencyHeader } from "@/components/EmergencyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, AlertTriangle, Hospital, Flame, Shield, Waves, Ambulance } from "lucide-react";

const EmergencyContacts = () => {
  const emergencyServices = [
    {
      category: "Emergency Services",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
      contacts: [
        { name: "Ambulance (SAMU)", number: "1990", icon: Ambulance },
        { name: "Fire & Rescue", number: "111", icon: Flame },
        { name: "Police Emergency", number: "119", icon: Shield },
        { name: "Disaster Management Centre", number: "117", icon: Waves },
      ]
    },
    {
      category: "Medical Emergency",
      icon: Hospital,
      color: "bg-blue-100 text-blue-600",
      contacts: [
        { name: "National Hospital Colombo", number: "011-269-1111", icon: Hospital },
        { name: "Accident Service", number: "011-269-3184", icon: Ambulance },
        { name: "Sri Jayawardenepura Hospital", number: "011-277-7777", icon: Hospital },
        { name: "Kalubowila Hospital", number: "011-258-6320", icon: Hospital },
      ]
    },
    {
      category: "Disaster Management",
      icon: Waves,
      color: "bg-orange-100 text-orange-600",
      contacts: [
        { name: "DMC Head Office", number: "011-2-136136", icon: Shield },
        { name: "DMC Fax", number: "011-2-878052", icon: Phone },
        { name: "Meteorology Department", number: "011-2-686856", icon: Waves },
        { name: "Water Management", number: "011-2-587623", icon: Waves },
      ]
    },
    {
      category: "Regional Offices",
      icon: Phone,
      color: "bg-green-100 text-green-600",
      contacts: [
        { name: "Colombo District", number: "011-2-696331", icon: Phone },
        { name: "Gampaha District", number: "033-2-223901", icon: Phone },
        { name: "Kalutara District", number: "034-2-222491", icon: Phone },
        { name: "Galle District", number: "091-2-234282", icon: Phone },
      ]
    }
  ];

  return (
    <AppShell>
      <EmergencyHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Emergency Contacts</h1>
            <p className="text-muted-foreground">
              Important phone numbers for emergency assistance in Sri Lanka
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {emergencyServices.map((service) => {
            const CategoryIcon = service.icon;
            return (
              <Card key={service.category} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${service.color}`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl">{service.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.contacts.map((contact) => {
                    const ContactIcon = contact.icon;
                    return (
                      <div 
                        key={contact.number}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ContactIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{contact.name}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2"
                          onClick={() => window.location.href = `tel:${contact.number}`}
                        >
                          <Phone className="w-3 h-3" />
                          {contact.number}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardContent className="py-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-yellow-900">
                <p className="font-semibold">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>For immediate life-threatening emergencies, call 119 (Police) or 1990 (Ambulance)</li>
                  <li>Keep your phone charged and save these numbers in your contacts</li>
                  <li>Provide clear location details when calling for help</li>
                  <li>Stay calm and speak clearly when reporting an emergency</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default EmergencyContacts;
