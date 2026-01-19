import { useEffect, useState } from "react";
import { User, Upload, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AgentProfile {
  id: number;
  name: string;
  phone: string;
  email: string;
  bio: string;
  image: string;
  website: string;
  officeAddress: string;
  cityId: number;
  specialties: string[];
}

const SPECIALTY_OPTIONS = [
  "Luxury Properties",
  "Commercial",
  "Residential",
  "Investment",
  "New Developments",
  "Rentals",
];

const API_URL = `http://${window.location.hostname}:3001`;

const AgentProfilePage = () => {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    bio: "",
    image: "",
    website: "",
    officeAddress: "",
    cityId: "",
    specialties: [] as string[],
  });

  useEffect(() => {
    fetchProfile();
    fetchCities();
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API_URL}/api/specializations`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAvailableSpecialties(data.map((s: any) => s.name));
      }
    } catch (error) {
      console.error("Failed to fetch specializations");
      // Fallback
      setAvailableSpecialties(SPECIALTY_OPTIONS);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agent/profile`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      let specialties: string[] = [];
      if (data.specialties) {
        try {
          specialties = JSON.parse(data.specialties);
        } catch {
          specialties = [];
        }
      }

      setProfile(data);
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        bio: data.bio || "",
        image: data.imageKey || data.image || "",
        website: data.website || "",
        officeAddress: data.officeAddress || "",
        cityId: data.cityId?.toString() || "",
        specialties,
      });
      setImagePreview(data.image);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cities`);
      const data = await res.json();
      setCities(data);
    } catch (error) {
      console.error("Failed to fetch cities");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const res = await fetch(`${API_URL}/api/upload?type=agent`, {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();

      if (data.success && data.signedUrl) {
        setFormData({ ...formData, image: data.key });
        setImagePreview(data.signedUrl);
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    const current = formData.specialties;
    if (current.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: current.filter((s) => s !== specialty),
      });
    } else {
      setFormData({
        ...formData,
        specialties: [...current, specialty],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/agent/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-600 mt-1">Update your agent profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-8">
          
          {/* Profile Photo */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button type="button" variant="outline" disabled={uploading} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Change Photo"}
                  </span>
                </Button>
              </label>
              {imagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setImagePreview(null); setFormData({ ...formData, image: "" }); }}
                  className="ml-2 text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+964 750 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio / About</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-slate-200 min-h-[120px]"
              placeholder="Tell clients about yourself and your experience..."
            />
          </div>

          {/* Office */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Office Address</label>
              <Input
                value={formData.officeAddress}
                onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                placeholder="123 Main Street, Suite 4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <select
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-slate-200"
              >
                <option value="">Select City</option>
                {cities.map((city: any) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium mb-2">Specialties</label>
            <div className="flex flex-wrap gap-2">
              {(availableSpecialties.length > 0 ? availableSpecialties : SPECIALTY_OPTIONS).map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.specialties.includes(specialty)
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100">
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AgentProfilePage;
