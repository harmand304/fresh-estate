import { NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  MapPin, 
  ArrowLeft,
  Home,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/properties", icon: Building2, label: "Properties" },
    { to: "/admin/projects", icon: Layers, label: "Projects" },
    { to: "/admin/agents", icon: Users, label: "Agents" },
    { to: "/admin/locations", icon: MapPin, label: "Locations" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-slate-900 text-white flex flex-col z-50">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Admin Panel
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
                    ? "bg-primary text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Back to Site - Fixed at bottom of sidebar */}
        <div className="p-4 border-t border-slate-700 mt-auto">
          <Button asChild variant="outline" className="w-full text-slate-900">
            <NavLink to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Site
            </NavLink>
          </Button>
        </div>
      </aside>

      {/* Main Content - With left margin for fixed sidebar */}
      <main className="ml-64 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
