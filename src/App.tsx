import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import EmergencyMap from "./pages/EmergencyMap";
import MissingPersons from "./pages/MissingPersons";
import NotFound from "./pages/NotFound";
import { AppShell } from "@/components/layout/AppShell";

const queryClient = new QueryClient();

// Layout wrapper for pages that need the full app shell
const WithLayout = ({ children }: { children: React.ReactNode }) => (
  <AppShell>
    {children}
  </AppShell>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <WithLayout>
              <Index />
            </WithLayout>
          } />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={
            <WithLayout>
              <Admin />
            </WithLayout>
          } />
          <Route path="/map" element={<EmergencyMap />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;