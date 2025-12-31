import { useEffect, useState } from "react";
import { Building2, Handshake, CheckCircle, DollarSign, TrendingUp, FileBarChart, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalListings: number;
  activeDeals: number;
  completedDeals: number;
  totalRevenue: number;
  recentDeals: Array<{
    id: number;
    propertyTitle: string;
    clientName: string;
    dealType: string;
    price: number;
    status: string;
    createdAt: string;
  }>;
}

interface ReportData {
  period: string;
  sales: { count: number; revenue: number };
  rentals: { count: number; revenue: number };
  totalDeals: number;
  totalRevenue: number;
}

const API_URL = `http://${window.location.hostname}:3001`;

const AgentDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (showReport) {
      fetchReportData();
    }
  }, [showReport, reportPeriod]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agent/dashboard`, {
        credentials: "include",
      });
      if (!res.ok) {
        // Set default stats on error
        setStats({
          totalListings: 0,
          activeDeals: 0,
          completedDeals: 0,
          totalRevenue: 0,
          recentDeals: []
        });
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch (error) {
      // Silent fail with default data instead of error toast
      setStats({
        totalListings: 0,
        activeDeals: 0,
        completedDeals: 0,
        totalRevenue: 0,
        recentDeals: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    setLoadingReport(true);
    try {
      const res = await fetch(`${API_URL}/api/agent/reports?period=${reportPeriod}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      toast.error("Failed to load report");
    } finally {
      setLoadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "My Listings",
      value: stats?.totalListings || 0,
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      label: "Active Deals",
      value: stats?.activeDeals || 0,
      icon: Handshake,
      color: "bg-amber-500",
    },
    {
      label: "Completed Deals",
      value: stats?.completedDeals || 0,
      icon: CheckCircle,
      color: "bg-emerald-500",
    },
    {
      label: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-500",
    },
  ];

  const periodLabels = {
    today: 'Today',
    week: 'This Week',
    month: 'Last Month',
    all: 'All Time'
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agent Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's your performance overview.</p>
        </div>
        <Button 
          onClick={() => setShowReport(true)}
          className="flex items-center gap-2"
        >
          <FileBarChart className="w-5 h-5" />
          View Reports
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Deals */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Recent Deals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Property</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Client</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentDeals && Array.isArray(stats.recentDeals) && stats.recentDeals.length > 0 ? (
                stats.recentDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{deal.propertyTitle}</td>
                    <td className="px-6 py-4 text-slate-600">{deal.clientName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        deal.dealType === "SALE" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {deal.dealType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">${deal.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        deal.status === "COMPLETED" 
                          ? "bg-green-100 text-green-700" 
                          : deal.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {deal.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No deals yet. Create your first deal to see it here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <FileBarChart className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Performance Report</h2>
              </div>
              <button 
                onClick={() => setShowReport(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
              >
                <X className="w-5 h-5 text-red-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Period Selector */}
              <div className="flex gap-2 mb-6">
                {(['today', 'week', 'month', 'all'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setReportPeriod(period)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      reportPeriod === period 
                        ? 'bg-primary text-white shadow-[0_4px_0_0_#15803d] hover:shadow-[0_2px_0_0_#15803d] hover:translate-y-[2px]' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {periodLabels[period]}
                  </button>
                ))}
              </div>

              {loadingReport ? (
                <div className="py-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-500 mt-2">Loading report...</p>
                </div>
              ) : reportData ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-5 text-white">
                      <p className="text-white/80 text-sm">Sales</p>
                      <p className="text-3xl font-bold">{reportData.sales.count}</p>
                      <p className="text-lg mt-1">${reportData.sales.revenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
                      <p className="text-white/80 text-sm">Rentals</p>
                      <p className="text-3xl font-bold">{reportData.rentals.count}</p>
                      <p className="text-lg mt-1">${reportData.rentals.revenue.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Total Summary */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Summary - {periodLabels[reportPeriod]}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-500">Total Deals</p>
                        <p className="text-2xl font-bold text-slate-900">{reportData.totalDeals}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-primary">${reportData.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Sales Revenue</span>
                        <span className="font-medium text-emerald-600">${reportData.sales.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Rental Revenue</span>
                        <span className="font-medium text-blue-600">${reportData.rentals.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 font-semibold">
                        <span className="text-slate-900">Total</span>
                        <span className="text-primary">${reportData.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  No data available for this period.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;

