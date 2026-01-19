import { useState, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import SplashScreen from "./components/SplashScreen";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import CookieConsent from "./components/CookieConsent";
import AnalyticsTracker from "./components/AnalyticsTracker";

// Lazy load all page components
const Index = lazy(() => import("./pages/Index"));
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Agents = lazy(() => import("./pages/Agents"));
const AgentProfile = lazy(() => import("./pages/AgentProfile"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages - lazy loaded
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminAgents = lazy(() => import("./pages/admin/AdminAgents"));
const AdminLocations = lazy(() => import("./pages/admin/AdminLocations"));

// Agent pages - lazy loaded
const AgentLayout = lazy(() => import("./pages/agent/AgentLayout"));
const AgentDashboard = lazy(() => import("./pages/agent/AgentDashboard"));
const AgentListings = lazy(() => import("./pages/agent/AgentListings"));
const AgentInquiries = lazy(() => import("./pages/agent/AgentInquiries"));
const AgentDeals = lazy(() => import("./pages/agent/AgentDeals"));
const AgentProfilePage = lazy(() => import("./pages/agent/AgentProfile"));
const AgentReviews = lazy(() => import("./pages/agent/AgentReviews"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute - data stays fresh for 1 minute
      gcTime: 300000, // 5 minutes - cached data kept in memory for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
});

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
                <Suspense
                  fallback={
                    <div className="flex justify-center items-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  }
                >
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
                </Suspense>
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
