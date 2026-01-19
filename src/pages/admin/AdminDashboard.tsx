import { useEffect, useState } from "react";
import { API_URL } from "@/config";
import { Building2, Users, MapPin, Globe, TrendingUp } from "lucide-react";

interface Stats {
  propertyCount: number;
  agentCount: number;
  cityCount: number;
  locationCount: number;
}

interface RecentProperty {
  id: string;
  title: string;
  price: number;
  city: string;
}
const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch(`${API_URL}/api/admin/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setRecentProperties(data.recentProperties);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Properties", value: stats?.propertyCount || 0, icon: Building2, color: "bg-blue-500" },
    { label: "Agents", value: stats?.agentCount || 0, icon: Users, color: "bg-green-500" },
    { label: "Cities", value: stats?.cityCount || 0, icon: Globe, color: "bg-purple-500" },
    { label: "Locations", value: stats?.locationCount || 0, icon: MapPin, color: "bg-orange-500" },
  ];

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-slate-200 w-48 rounded mb-8"></div>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-800">Recent Properties</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {recentProperties.map((property) => (
            <div key={property.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">{property.title}</p>
                <p className="text-sm text-slate-500">{property.city}</p>
              </div>
              <p className="font-semibold text-primary">
                ${property.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
