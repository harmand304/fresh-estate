import { useEffect, useState } from "react";
import { Plus, CheckCircle, XCircle, Clock, Phone, Mail, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Deal {
  id: number;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  dealType: string;
  price: number;
  status: string;
  notes: string;
  createdAt: string;
  completedAt: string | null;
}

interface Property {
  id: string;
  title: string;
}

const API_URL = `http://${window.location.hostname}:3001`;

const AgentDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [formData, setFormData] = useState({
    propertyId: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    dealType: "SALE",
    price: "",
    notes: "",
  });

  useEffect(() => {
    fetchDeals();
    fetchProperties();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agent/deals`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDeals(data);
    } catch (error) {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agent/properties`, {
        credentials: "include",
      });
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error("Failed to fetch properties");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.propertyId || !formData.clientName) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/agent/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create");

      toast.success("Deal created!");
      setIsDialogOpen(false);
      resetForm();
      fetchDeals();
    } catch (error) {
      toast.error("Failed to create deal");
    }
  };

  const updateStatus = async (dealId: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/agent/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(`Deal marked as ${status.toLowerCase()}`);
      fetchDeals();
    } catch (error) {
      toast.error("Failed to update deal");
    }
  };

  const deleteDeal = async (dealId: number) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      const res = await fetch(`${API_URL}/api/agent/deals/${dealId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Deal deleted!");
      fetchDeals();
    } catch (error) {
      toast.error("Failed to delete deal");
    }
  };

  const resetForm = () => {
    setFormData({
      propertyId: "",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      dealType: "SALE",
      price: "",
      notes: "",
    });
  };

  const filteredDeals = filter === "ALL" 
    ? deals 
    : deals.filter(d => d.status === filter);

  const statusCounts = {
    ALL: deals.length,
    PENDING: deals.filter(d => d.status === "PENDING").length,
    COMPLETED: deals.filter(d => d.status === "COMPLETED").length,
    CANCELLED: deals.filter(d => d.status === "CANCELLED").length,
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Deals</h1>
          <p className="text-slate-600 mt-1">Track your property sales and rentals</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsDialogOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" /> New Deal
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["ALL", "PENDING", "COMPLETED", "CANCELLED"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === status
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
            <span className="ml-2 px-2 py-0.5 rounded-lg text-xs bg-white/20">
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Deals List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Handshake className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No deals found</h3>
          <p className="text-slate-500 mt-2">
            {filter === "ALL" 
              ? "Create your first deal to start tracking"
              : `No ${filter.toLowerCase()} deals`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeals.map((deal) => (
            <div 
              key={deal.id} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-slate-900">{deal.propertyTitle}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      deal.dealType === "SALE" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {deal.dealType}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      deal.status === "COMPLETED" 
                        ? "bg-green-100 text-green-700" 
                        : deal.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {deal.status === "PENDING" && <Clock className="w-3 h-3 inline mr-1" />}
                      {deal.status === "COMPLETED" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {deal.status === "CANCELLED" && <XCircle className="w-3 h-3 inline mr-1" />}
                      {deal.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div>
                      <span className="font-medium text-slate-900">Client:</span> {deal.clientName}
                    </div>
                    {deal.clientPhone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {deal.clientPhone}
                      </div>
                    )}
                    {deal.clientEmail && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {deal.clientEmail}
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <span className="text-2xl font-bold text-emerald-600">
                      ${deal.price.toLocaleString()}
                    </span>
                    <span className="text-slate-500 text-sm ml-2">
                      Created {new Date(deal.createdAt).toLocaleDateString()}
                    </span>
                    {deal.completedAt && (
                      <span className="text-green-600 text-sm ml-2">
                        • Completed {new Date(deal.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {deal.notes && (
                    <p className="mt-2 text-sm text-slate-500 italic">"{deal.notes}"</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {deal.status === "PENDING" && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => updateStatus(deal.id, "COMPLETED")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Complete
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(deal.id, "CANCELLED")}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    </>
                  )}
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteDeal(deal.id)}
                    className="text-slate-500 hover:text-red-500"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Deal Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">New Deal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Property *</label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200"
                  required
                >
                  <option value="">Select Property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client Name *</label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+964 750 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="client@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Deal Type</label>
                  <select
                    value={formData.dealType}
                    onChange={(e) => setFormData({ ...formData, dealType: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-slate-200"
                  >
                    <option value="SALE">Sale</option>
                    <option value="RENT">Rent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="250000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 min-h-[80px]"
                  placeholder="Any additional notes about this deal..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  Create Deal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDeals;
