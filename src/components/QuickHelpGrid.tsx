// src/components/QuickHelpGrid.tsx
import { UtensilsCrossed, Home, Heart, Car, Phone, Users, Utensils, Droplets, Pill, Wifi } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const helpCategories = [
  { 
    icon: <UtensilsCrossed className="w-6 h-6" />, 
    label: "Food & Water", 
    color: "bg-orange-100 text-orange-600 border-orange-200",
    description: "Emergency food supplies and clean water",
    type: "offer",
    searchTerm: "food"
  },
  { 
    icon: <Home className="w-6 h-6" />, 
    label: "Shelter", 
    color: "bg-blue-100 text-blue-600 border-blue-200",
    description: "Safe places to stay and accommodation",
    type: "offer",
    searchTerm: "shelter"
  },
  { 
    icon: <Heart className="w-6 h-6" />, 
    label: "Medical", 
    color: "bg-red-100 text-red-600 border-red-200",
    description: "Healthcare assistance and first aid",
    type: "offer", 
    searchTerm: "medical"
  },
  { 
    icon: <Car className="w-6 h-6" />, 
    label: "Transport", 
    color: "bg-green-100 text-green-600 border-green-200",
    description: "Emergency transport and evacuation",
    type: "offer",
    searchTerm: "transport"
  },
  { 
    icon: <Phone className="w-6 h-6" />, 
    label: "Communication", 
    color: "bg-purple-100 text-purple-600 border-purple-200",
    description: "Phones, charging, internet access",
    type: "offer",
    searchTerm: "communication"
  },
  { 
    icon: <Users className="w-6 h-6" />, 
    label: "Volunteer", 
    color: "bg-teal-100 text-teal-600 border-teal-200",
    description: "Join rescue and relief efforts",
    type: "offer",
    searchTerm: "volunteer"
  },
  { 
    icon: <Utensils className="w-6 h-6" />, 
    label: "Need Food", 
    color: "bg-amber-100 text-amber-600 border-amber-200",
    description: "Urgently need food supplies",
    type: "request",
    searchTerm: "food"
  },
  { 
    icon: <Droplets className="w-6 h-6" />, 
    label: "Need Water", 
    color: "bg-cyan-100 text-cyan-600 border-cyan-200",
    description: "Need clean drinking water",
    type: "request",
    searchTerm: "water"
  },
  { 
    icon: <Pill className="w-6 h-6" />, 
    label: "Medical Help", 
    color: "bg-rose-100 text-rose-600 border-rose-200",
    description: "Need medical attention",
    type: "request",
    searchTerm: "medical"
  },
  { 
    icon: <Home className="w-6 h-6" />, 
    label: "Need Shelter", 
    color: "bg-indigo-100 text-indigo-600 border-indigo-200",
    description: "Need safe place to stay",
    type: "request",
    searchTerm: "shelter"
  },
  { 
    icon: <Wifi className="w-6 h-6" />, 
    label: "Communication", 
    color: "bg-violet-100 text-violet-600 border-violet-200",
    description: "Need phone/internet access",
    type: "request",
    searchTerm: "communication"
  },
  { 
    icon: <Car className="w-6 h-6" />, 
    label: "Transport Help", 
    color: "bg-emerald-100 text-emerald-600 border-emerald-200",
    description: "Need emergency transport",
    type: "request",
    searchTerm: "transport"
  },
];

export const QuickHelpGrid = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: typeof helpCategories[0]) => {
    // You can implement different actions based on category type
    if (category.type === 'request') {
      // Scroll to requests or filter requests
      console.log('Filter requests by:', category.searchTerm);
      // You could also open the request form pre-filled
      // setRequestFormOpen(true);
    } else {
      // Scroll to offers or filter offers
      console.log('Filter offers by:', category.searchTerm);
      // You could also open the offer form pre-filled
      // setOfferFormOpen(true);
    }
    
    // For now, just show a console log
    console.log(`Clicked: ${category.label} - ${category.type}`);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Quick Help Access</h2>
        <div className="flex gap-2 text-sm">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Offer Help
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            Need Help
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {helpCategories.map((category, index) => (
          <Card 
            key={index} 
            className={`text-center cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 ${category.color} hover:border-current`}
            onClick={() => handleCategoryClick(category)}
          >
            <CardContent className="p-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 bg-white/50`}>
                {category.icon}
              </div>
              <h3 className="font-semibold text-xs mb-1 leading-tight">{category.label}</h3>
              <p className="text-[10px] text-gray-600 leading-tight">{category.description}</p>
              <div className={`mt-2 text-[10px] font-medium px-2 py-1 rounded-full ${
                category.type === 'request' 
                  ? 'bg-amber-500/20 text-amber-700' 
                  : 'bg-green-500/20 text-green-700'
              }`}>
                {category.type === 'request' ? 'Need Help' : 'Offer Help'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Phone className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-semibold text-red-800 mb-1">Emergency Calls</h3>
          <p className="text-sm text-red-700">Police: 119 • Ambulance: 1990</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-blue-800 mb-1">Nearest Help</h3>
          <p className="text-sm text-blue-700">Find help providers in your area</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Heart className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-green-800 mb-1">Quick Guide</h3>
          <p className="text-sm text-green-700">Emergency procedures and safety tips</p>
        </div>
      </div>
    </div>
  );
};