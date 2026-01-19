import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Upload, Star, Award, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Agent {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  bio: string | null;
  image: string | null;
  website: string | null;
  experience: number | null;
  rating: number | null;
  reviewCount: number | null;
  specialties: string[] | null;
  officeAddress: string | null;
  isTopAgent: boolean;
  cityId: number | null;
  cityName: string;
  propertyCount: number;
  languages?: string[];
}

interface City {
  id: number;
  name: string;
}

interface Language {
  id: number;
  name: string;
}

const API_URL = "https://fresh-estate.onrender.com";

const SPECIALTY_OPTIONS = [
  "Luxury Homes",
  "Commercial",
  "Residential",
  "Land",
  "Investment",
  "First-Time Buyers",
  "Downtown",
  "Suburban",
  "Eco-Friendly",
  "Vacation Homes"
];

const AdminAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    bio: "",
    image: "",
    website: "",
    experience: "",
    rating: "",
    specialties: [] as string[],
    languages: [] as number[],
    officeAddress: "",
    isTopAgent: false,
    cityId: "",
    password: "",
    loginEmail: ""
  });

  const [languages, setLanguages] = useState<Language[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);

  const fetchAgents = () => {
    setLoading(true);
    fetch(`${API_URL}/api/agents`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAgents(data);
        } else {
          console.error("Agents data is not an array:", data);
          setAgents([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch agents:", err);
        setAgents([]);
        setLoading(false);
      });
  };

  const fetchCities = () => {
    fetch(`${API_URL}/api/cities`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCities(data);
        } else {
          setCities([]);
        }
      })
      .catch(() => setCities([]));
  };



  const fetchLanguages = () => {
    fetch(`${API_URL}/api/languages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLanguages(data);
        }
      })
      .catch((err) => console.error("Error fetching languages:", err));
  };

  const fetchSpecialties = () => {
    fetch(`${API_URL}/api/specializations`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableSpecialties(data.map((s: any) => s.name));
        }
      })
      .catch((err) => console.error("Error fetching specialties:", err));
  };

  useEffect(() => {
    fetchAgents();
    fetchCities();
    fetchLanguages();
    fetchSpecialties();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      bio: "",
      image: "",
      website: "",
      experience: "",
      rating: "",
      specialties: [],
      languages: [],
      officeAddress: "",
      isTopAgent: false,
      cityId: "",
      password: "",
      loginEmail: ""
    });
    setEditingAgent(null);
    setImagePreview(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (agent: Agent) => {
    setEditingAgent(agent);

    // Backend now sends array, but handle safely
    const specialties = Array.isArray(agent.specialties)
      ? agent.specialties
      : [];

    // Map language names (strings) back to IDs for the form
    const currentLangIds = (agent.languages || [])
      .map(name => languages.find(l => l.name === name)?.id)
      .filter((id): id is number => id !== undefined);

    setFormData({
      name: agent.name,
      phone: agent.phone || "",
      email: agent.email || "",
      bio: agent.bio || "",
      image: agent.image || "",
      website: agent.website || "",
      experience: agent.experience?.toString() || "",
      rating: agent.rating?.toString() || "",
      specialties: Array.isArray(specialties) ? specialties : [],
      languages: currentLangIds,
      officeAddress: agent.officeAddress || "",
      isTopAgent: agent.isTopAgent || false,
      cityId: agent.cityId?.toString() || "",
      password: "",
      loginEmail: ""
    });
    setImagePreview(agent.image || null);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const res = await fetch(`${API_URL}/api/upload?type=agent`, {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();

      if (data.success && data.signedUrl) {
        setFormData({ ...formData, image: data.key });
        setImagePreview(data.signedUrl);
        toast.success('Image uploaded!');
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const toggleLanguage = (languageId: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(languageId)
        ? prev.languages.filter(id => id !== languageId)
        : [...prev.languages, languageId]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    const payload = {
      name: formData.name,
      phone: formData.phone || null,
      email: formData.email || null,
      bio: formData.bio || null,
      image: formData.image || null,
      website: formData.website || null,
      experience: formData.experience ? parseInt(formData.experience) : 0,
      rating: formData.rating ? parseFloat(formData.rating) : 0,
      specialties: formData.specialties,
      languages: formData.languages,
      officeAddress: formData.officeAddress || null,
      isTopAgent: formData.isTopAgent,
      cityId: formData.cityId ? parseInt(formData.cityId) : null,
      password: formData.password,
      loginEmail: formData.loginEmail
    };

    // Require password & login email for new agents
    if (!editingAgent && (!payload.password || !payload.loginEmail)) {
      toast.error('Login email and password are required for new agents');
      return;
    }

    try {
      const url = editingAgent
        ? `${API_URL}/api/agents/${editingAgent.id}`
        : `${API_URL}/api/agents`;

      const res = await fetch(url, {
        method: editingAgent ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingAgent ? "Agent updated!" : "Agent created!");
        setIsDialogOpen(false);
        fetchAgents();
        resetForm();
      } else {
        toast.error("Failed to save agent");
      }
    } catch {
      toast.error("Error saving agent");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      const res = await fetch(`${API_URL}/api/agents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Agent deleted!");
        fetchAgents();
      }
    } catch {
      toast.error("Failed to delete agent");
    }
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.cityName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Agents</h1>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" /> Add Agent
        </Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-medium text-slate-600">Agent</th>
              <th className="text-left p-4 font-medium text-slate-600">Contact</th>
              <th className="text-left p-4 font-medium text-slate-600">City</th>
              <th className="text-left p-4 font-medium text-slate-600">Stats</th>
              <th className="text-right p-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No agents found</td>
              </tr>
            ) : (
              filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                        {agent.image ? (
                          <img src={agent.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Image className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{agent.name}</span>
                          {agent.isTopAgent && (
                            <Award className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        {agent.experience && (
                          <span className="text-sm text-slate-500">{agent.experience} years exp.</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-slate-600">{agent.phone || "-"}</p>
                      <p className="text-slate-400">{agent.email || ""}</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{agent.cityName || "-"}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {agent.rating ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {agent.rating}
                        </span>
                      ) : null}
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-sm">
                        {agent.propertyCount} listings
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(agent)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(agent.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAgent ? "Edit Agent" : "Add New Agent"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Profile Image Upload */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 text-slate-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Label>Profile Photo</Label>
                <p className="text-sm text-slate-500 mb-2">Upload agent's profile photo</p>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </span>
                  </label>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...formData, image: '' });
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Agent name"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+964 750 123 4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Public contact email"
                />
              </div>
              <div>
                <Label>Login Email *</Label>
                <Input
                  type="email"
                  value={formData.loginEmail}
                  onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                  placeholder="Private login email"
                  disabled={!!editingAgent} // Only for new agents
                />
              </div>
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Set login password"
                  disabled={!!editingAgent} // Only for new agents
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label>Bio / About</Label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Write a brief description about the agent..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <Label>City</Label>
                <Select
                  value={formData.cityId}
                  onValueChange={(v) => setFormData({ ...formData, cityId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Top Agent Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isTopAgent"
                checked={formData.isTopAgent}
                onChange={(e) => setFormData({ ...formData, isTopAgent: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <Label htmlFor="isTopAgent" className="flex items-center gap-2 cursor-pointer">
                <Award className="w-4 h-4 text-amber-500" />
                Mark as Top Agent (shows badge)
              </Label>
            </div>

            {/* Specialties */}
            <div>
              <Label>Specialties</Label>
              <p className="text-sm text-slate-500 mb-2">Select agent's areas of expertise</p>
              <div className="flex flex-wrap gap-2">
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => toggleSpecialty(specialty)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${formData.specialties.includes(specialty)
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <Label>Languages</Label>
              <p className="text-sm text-slate-500 mb-2">Select languages the agent speaks</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => toggleLanguage(lang.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${formData.languages.includes(lang.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {lang.name}
                  </button>
                ))}
                {languages.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No languages available. Add some in Admin → Languages.</p>
                )}
              </div>
            </div>

            {/* Office Address */}
            <div>
              <Label>Office Address</Label>
              <Input
                value={formData.officeAddress}
                onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                placeholder="Empire Business Center, Erbil"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingAgent ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgents;
