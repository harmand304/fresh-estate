import { useEffect, useState } from "react";
import { Mail, Phone, MessageSquare, Clock, CheckCircle, XCircle, Eye, Bed, Bath, Maximize, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  type: 'TOUR' | 'MESSAGE';
  status: 'PENDING' | 'RESPONDED' | 'CLOSED';
  createdAt: string;
  property: {
    id: string;
    title: string;
    price: number;
    purpose: string;
    image: string | null;
    bedrooms: number;
    bathrooms: number;
    areaSqm: number | null;
    area: string;
    city: string;
    shortDescription: string | null;
  };
}

const API_URL = `http://${window.location.hostname}:3001`;

const AgentInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESPONDED' | 'CLOSED'>('ALL');

  const filteredInquiries = statusFilter === 'ALL' 
    ? inquiries 
    : inquiries.filter(i => i.status === statusFilter);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agent/inquiries`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setInquiries(data);
    } catch (error) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/agent/inquiries/${id}`, {
        method: 'PATCH',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success('Status updated');
        fetchInquiries();
        setSelectedInquiry(null);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>;
      case 'RESPONDED':
        return <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">Responded</span>;
      case 'CLOSED':
        return <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">Closed</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'TOUR' 
      ? <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">Tour Request</span>
      : <span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">Message</span>;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Inquiries</h1>
        <p className="text-slate-600 mt-1">Manage tour requests and messages from potential clients.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'ALL' 
              ? 'bg-slate-900 text-white' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All ({inquiries.length})
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'PENDING' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-white text-slate-600 hover:bg-yellow-50 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending ({inquiries.filter(i => i.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setStatusFilter('RESPONDED')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'RESPONDED' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Responded ({inquiries.filter(i => i.status === 'RESPONDED').length})
        </button>
        <button
          onClick={() => setStatusFilter('CLOSED')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'CLOSED' 
              ? 'bg-green-500 text-white' 
              : 'bg-white text-slate-600 hover:bg-green-50 border border-slate-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Closed ({inquiries.filter(i => i.status === 'CLOSED').length})
        </button>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {statusFilter === 'ALL' ? 'All Inquiries' : `${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()} Inquiries`}
          </h2>
        </div>
        
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No inquiries</h3>
            <p className="text-slate-500">
              {statusFilter === 'ALL' 
                ? "When clients request tours or send messages, they'll appear here." 
                : `No ${statusFilter.toLowerCase()} inquiries found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {/* Property Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {inquiry.property.image ? (
                        <img 
                          src={inquiry.property.image} 
                          alt={inquiry.property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    {/* Inquiry Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeBadge(inquiry.type)}
                        {getStatusBadge(inquiry.status)}
                      </div>
                      <h3 className="font-semibold text-slate-900 truncate">{inquiry.property.title}</h3>
                      <p className="text-sm text-slate-500 mb-2">
                        ${inquiry.property.price.toLocaleString()} • {inquiry.property.purpose}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-slate-700">{inquiry.name}</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {inquiry.email}
                        </span>
                        {inquiry.phone && (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {inquiry.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      View
                    </Button>
                    {inquiry.status === 'PENDING' && (
                      <Button 
                        size="sm"
                        onClick={() => updateStatus(inquiry.id, 'RESPONDED')}
                      >
                        Mark Responded
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Inquiry Details</h2>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-6 h-6 text-red-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Property Card */}
              <div className="bg-slate-50 rounded-xl p-4">
                <label className="text-sm font-medium text-slate-500 mb-3 block">Property Details</label>
                <div className="flex gap-4">
                  {/* Property Image */}
                  <div className="w-32 h-24 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                    {selectedInquiry.property.image ? (
                      <img 
                        src={selectedInquiry.property.image} 
                        alt={selectedInquiry.property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Eye className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  {/* Property Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{selectedInquiry.property.title}</h3>
                    <div className="flex items-center text-sm text-slate-500 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {selectedInquiry.property.area}, {selectedInquiry.property.city}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" /> {selectedInquiry.property.bedrooms} beds
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" /> {selectedInquiry.property.bathrooms} baths
                      </span>
                      {selectedInquiry.property.areaSqm && (
                        <span className="flex items-center gap-1">
                          <Maximize className="w-4 h-4" /> {selectedInquiry.property.areaSqm} m²
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ${selectedInquiry.property.price.toLocaleString()}
                        {selectedInquiry.property.purpose === 'RENT' && <span className="text-sm font-normal">/mo</span>}
                      </span>
                      <Link 
                        to={`/property/${selectedInquiry.property.id}`}
                        className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
                        target="_blank"
                      >
                        View Property <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <label className="text-sm font-medium text-slate-500 mb-3 block">Client Information</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Name</p>
                    <p className="text-slate-900 font-medium">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Type</p>
                    <p>{getTypeBadge(selectedInquiry.type)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">{selectedInquiry.email}</a>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <p className="text-xs text-slate-400">Phone</p>
                      <a href={`tel:${selectedInquiry.phone}`} className="text-primary hover:underline">{selectedInquiry.phone}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-slate-500 mb-2 block">Message</label>
                <p className="text-slate-900 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-slate-500 mb-2 block">Status</label>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedInquiry.status === 'PENDING' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateStatus(selectedInquiry.id, 'PENDING')}
                  >
                    Pending
                  </Button>
                  <Button 
                    variant={selectedInquiry.status === 'RESPONDED' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateStatus(selectedInquiry.id, 'RESPONDED')}
                  >
                    Responded
                  </Button>
                  <Button 
                    variant={selectedInquiry.status === 'CLOSED' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateStatus(selectedInquiry.id, 'CLOSED')}
                  >
                    Closed
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentInquiries;
