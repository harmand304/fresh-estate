import { NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Handshake,
  User,
  Home,
  MessageSquare,
  MapPin,
  Layers,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AgentLayout = () => {
  const navItems = [
    { to: "/agent", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/agent/listings", icon: Building2, label: "My Listings" },
    { to: "/agent/projects", icon: Layers, label: "Projects" },
    { to: "/agent/locations", icon: MapPin, label: "Locations" },
    { to: "/agent/inquiries", icon: MessageSquare, label: "Inquiries" },
    { to: "/agent/deals", icon: Handshake, label: "Deals" },
    { to: "/agent/reviews", icon: Star, label: "Reviews" },
    { to: "/agent/profile", icon: User, label: "My Profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-emerald-900 to-emerald-950 text-white flex flex-col z-50">
        <div className="p-6 border-b border-emerald-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            Agent Portal
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "text-emerald-200 hover:bg-emerald-800 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Back to Site */}
        <div className="p-4 border-t border-emerald-700 mt-auto">
          <Button asChild variant="outline" className="w-full text-emerald-900 border-emerald-300 hover:bg-emerald-50">
            <NavLink to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Site
            </NavLink>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AgentLayout;
