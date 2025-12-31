import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Agents from "./pages/Agents";
import AgentProfile from "./pages/AgentProfile";
import Testimonials from "./pages/Testimonials";
import NotFound from "./pages/NotFound";
import SplashScreen from "./components/SplashScreen";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import CookieConsent from "./components/CookieConsent";
import AnalyticsTracker from "./components/AnalyticsTracker";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminLocations from "./pages/admin/AdminLocations";

// Agent pages
import AgentLayout from "./pages/agent/AgentLayout";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentListings from "./pages/agent/AgentListings";
import AgentInquiries from "./pages/agent/AgentInquiries";
import AgentDeals from "./pages/agent/AgentDeals";
import AgentProfilePage from "./pages/agent/AgentProfile";
import AgentReviews from "./pages/agent/AgentReviews";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {isLoading ? (
            <SplashScreen onFinish={() => setIsLoading(false)} />
          ) : (
            <>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <AnalyticsTracker />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/cities/:cityName" element={<Properties />} />
                  <Route path="/property/:id" element={<PropertyDetails />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/agents/:id" element={<AgentProfile />} />
                  <Route path="/testimonials" element={<Testimonials />} />

                  {/* Admin Routes - Protected, requires ADMIN role */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="properties" element={<AdminProperties />} />
                    <Route path="projects" element={<AdminProjects />} />
                    <Route path="agents" element={<AdminAgents />} />
                    <Route path="locations" element={<AdminLocations />} />
                  </Route>

                  {/* Agent Routes - Protected, requires AGENT role */}
                  <Route path="/agent" element={
                    <ProtectedRoute requireAgent>
                      <AgentLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AgentDashboard />} />
                    <Route path="listings" element={<AgentListings />} />
                    <Route path="projects" element={<AdminProjects />} />
                    <Route path="locations" element={<AdminLocations />} />
                    <Route path="inquiries" element={<AgentInquiries />} />
                    <Route path="deals" element={<AgentDeals />} />
                    <Route path="reviews" element={<AgentReviews />} />
                    <Route path="profile" element={<AgentProfilePage />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <CookieConsent />
              </BrowserRouter>
            </>
          )}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
