import { useState, useRef } from "react";
import { API_URL } from "@/config";
import { Plus, Pencil, Trash2, Home, Search, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { compressImages } from "@/utils/compressImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Property {
  id: string;
  title: string;
  price: number;
  purpose: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  image: string;
  imageKey?: string;
  area: string;
  city: string;
  type: string;
  dealCount: number;
  createdAt: string;
  locationId: number | null;
  propertyTypeId: number | null;
  dealStatus?: string;
  completedDealType?: string;
  description?: string;
  shortDescription?: string;
}

interface FormData {
  title: string;
  description: string;
  shortDescription: string;
  price: string;
  purpose: string;
  areaSqm: string;
  bedrooms: string;
  bathrooms: string;
  hasGarage: boolean;
  hasBalcony: boolean;
  imageKey: string;
  locationId: string;
  propertyTypeId: string;
}

interface DropdownData {
  locations: { id: number; name: string; cityName: string }[];
  propertyTypes: { id: number; name: string }[];
  amenities: { id: number; name: string }[];
}


const AgentListings = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Form State
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ key: string; signedUrl: string; dbId?: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    shortDescription: "",
    price: "",
    purpose: "SALE",
    areaSqm: "",
    bedrooms: "0",
    bathrooms: "0",
    hasGarage: false,
    hasBalcony: false,
    imageKey: "",
    locationId: "",
    propertyTypeId: "",
  });

  // Queries
  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['agent-properties'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/agent/properties`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json() as Promise<Property[]>;
    }
  });

  const { data: dropdowns = { locations: [], propertyTypes: [], amenities: [] } } = useQuery({
    queryKey: ['property-dropdowns'],
    queryFn: async () => {
      const [locs, types, ams] = await Promise.all([
        fetch(`${API_URL}/api/locations`).then((r) => r.json()),
        fetch(`${API_URL}/api/property-types`).then((r) => r.json()),
        fetch(`${API_URL}/api/amenities`).then((r) => r.json()),
      ]);
      return { locations: locs, propertyTypes: types, amenities: ams } as DropdownData;
    }
  });

  // Mutations
  const savePropertyMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string | null;
      shortDescription: string | null;
      price: number;
      purpose: string;
      areaSqm: number;
      bedrooms: number;
      bathrooms: number;
      hasGarage: boolean;
      hasBalcony: boolean;
      imageUrl: string | null;
      locationId: number | null;
      propertyTypeId: number | null;
    }) => {
      const url = editingProperty
        ? `${API_URL}/api/agent/properties/${editingProperty.id}`
        : `${API_URL}/api/agent/properties`;

      const res = await fetch(url, {
        method: editingProperty ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: async (data) => {
      const propertyId = data.id || editingProperty?.id;

      // Save NEW images
      const newImages = uploadedImages.filter(img => !img.dbId);
      if (newImages.length > 0 && propertyId) {
        const imagesPayload = newImages.map((img, idx) => ({
          key: img.key,
          sortOrder: uploadedImages.findIndex(i => i.key === img.key)
        }));

        await fetch(`${API_URL}/api/agent/properties/${propertyId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ images: imagesPayload }),
        });
      }

      // Save amenities
      if (selectedAmenities.length > 0 && propertyId) {
        await fetch(`${API_URL}/api/agent/properties/${propertyId}/amenities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ amenityIds: selectedAmenities }),
        });
      }

      toast.success(editingProperty ? "Property updated!" : "Property created!");
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
    },
    onError: () => {
      toast.error("Failed to save property");
    }
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/agent/properties/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      toast.success("Property deleted!");
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
    },
    onError: () => {
      toast.error("Failed to delete property");
    }
  });


  const resetForm = () => {
    setEditingProperty(null);
    setUploadedImages([]);
    setSelectedAmenities([]);
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      price: "",
      purpose: "SALE",
      areaSqm: "",
      bedrooms: "0",
      bathrooms: "0",
      hasGarage: false,
      hasBalcony: false,
      imageKey: "",
      locationId: "",
      propertyTypeId: "",
    });
  };

  const openEditDialog = async (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description || "",
      shortDescription: property.shortDescription || "",
      price: property.price.toString(),
      purpose: property.purpose,
      areaSqm: property.sqm?.toString() || "",
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      hasGarage: false,
      hasBalcony: false,
      imageKey: property.imageKey || "",
      locationId: property.locationId?.toString() || "",
      propertyTypeId: property.propertyTypeId?.toString() || "",
    });

    // Fetch details
    try {
      const res = await fetch(`${API_URL}/api/properties/${property.id}`);
      const data = await res.json();

      if (data.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
      }
      if (data.shortDescription) {
        setFormData(prev => ({ ...prev, shortDescription: data.shortDescription }));
      }

      if (data.hasGarage) setFormData(prev => ({ ...prev, hasGarage: true }));
      if (data.hasBalcony) setFormData(prev => ({ ...prev, hasBalcony: true }));

      // Load images
      if (data.images && data.images.length > 0 && data.imageKeys) {
        const imagesWithIds = data.images.map((url: string, idx: number) => ({
          key: data.imageKeys[idx]?.key || '',
          signedUrl: url,
          dbId: data.imageKeys[idx]?.id
        }));
        setUploadedImages(imagesWithIds);
      } else if (property.image) {
        setUploadedImages([{ key: property.imageKey || '', signedUrl: property.image }]);
      } else {
        setUploadedImages([]);
      }

      // Load amenities
      if (data.amenities && data.amenities.length > 0) {
        setSelectedAmenities(data.amenities.map((a: { id: number }) => a.id));
      } else {
        setSelectedAmenities([]);
      }
    } catch {
      setUploadedImages(property.image ? [{ key: property.imageKey || '', signedUrl: property.image }] : []);
      setSelectedAmenities([]);
    }

    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setUploading(true);

    try {
      // Compress images before upload
      toast.info('Compressing images...');
      const filesArray = Array.from(files);
      const compressedFiles = await compressImages(filesArray);

      const formDataUpload = new FormData();
      for (let i = 0; i < compressedFiles.length; i++) {
        formDataUpload.append("images", compressedFiles[i]);
      }

      const res = await fetch(`${API_URL}/api/upload/multiple`, {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();

      if (data.success) {
        setUploadedImages((prev) => [...prev, ...data.images]);
        if (uploadedImages.length === 0 && data.images.length > 0) {
          setFormData((prev) => ({ ...prev, imageKey: data.images[0].key }));
        }
        toast.success(`${data.images.length} image(s) uploaded!`);
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];

    if (imageToRemove.dbId) {
      try {
        await fetch(`${API_URL}/api/agent/property-images/${imageToRemove.dbId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData((prev) => ({ ...prev, imageKey: newImages[0]?.key || "" }));
    toast.success('Image removed');
  };

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      description: formData.description || null,
      shortDescription: formData.shortDescription || null,
      price: parseFloat(formData.price) || 0,
      purpose: formData.purpose,
      areaSqm: parseInt(formData.areaSqm) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      hasGarage: formData.hasGarage,
      hasBalcony: formData.hasBalcony,
      imageUrl: uploadedImages[0]?.key || formData.imageKey || null, // API expects imageUrl for main image key
      locationId: formData.locationId ? parseInt(formData.locationId) : null,
      propertyTypeId: formData.propertyTypeId ? parseInt(formData.propertyTypeId) : null,
    };

    savePropertyMutation.mutate(payload);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    deletePropertyMutation.mutate(id);
  };

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
          <p className="text-slate-600 mt-1">Manage your property listings</p>
        </div>
        <Button
          onClick={() => { resetForm(); setIsDialogOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Property
        </Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loadingProperties ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Home className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No properties yet</h3>
          <p className="text-slate-500 mt-2">Add your first listing to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-40 bg-slate-100 relative">
                {property.image ? (
                  <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                <span className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium ${property.dealStatus === 'COMPLETED'
                  ? "bg-red-500 text-white"
                  : property.purpose === "SALE" ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                  }`}>
                  {property.dealStatus === 'COMPLETED'
                    ? (property.completedDealType === 'SALE' ? "Sold" : "Rented")
                    : (property.purpose === "SALE" ? "For Sale" : "For Rent")
                  }
                </span>
                {property.dealCount > 0 && (
                  <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium bg-amber-500 text-white">
                    {property.dealCount} Deal{property.dealCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 truncate">{property.title}</h3>
                <p className="text-slate-500 text-sm">{property.area}, {property.city}</p>
                <p className="text-lg font-bold text-emerald-600 mt-2">
                  ${property.price.toLocaleString()}
                  {property.purpose === "RENT" && <span className="text-sm font-normal">/month</span>}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                  <span>{property.bedrooms} beds</span>
                  <span>{property.bathrooms} baths</span>
                  {property.sqm && <span>{property.sqm} m²</span>}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(property)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(property.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? "Edit Property" : "Add New Property"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Property title"
              />
            </div>

            {/* Description - Full Width */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700">Description (About this home)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the property features, location highlights, and special amenities..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                rows={4}
              />
            </div>

            {/* Short Description */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700">Short Description (for Cards/Carousel)</label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief summary (max 255 chars)..."
                maxLength={255}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Price ($)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="100000"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Purpose</label>
              <Select
                value={formData.purpose}
                onValueChange={(v) => setFormData({ ...formData, purpose: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALE">For Sale</SelectItem>
                  <SelectItem value="RENT">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Area (m²)</label>
              <Input
                type="number"
                value={formData.areaSqm}
                onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                placeholder="150"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Bedrooms</label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Bathrooms</label>
              <Input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                placeholder="2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Location</label>
              <Select
                value={formData.locationId}
                onValueChange={(v) => setFormData({ ...formData, locationId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {dropdowns.locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name} ({loc.cityName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Property Type</label>
              <Select
                value={formData.propertyTypeId}
                onValueChange={(v) => setFormData({ ...formData, propertyTypeId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {dropdowns.propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Feature Toggles */}
            <div className="col-span-2 flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasGarage}
                  onChange={(e) => setFormData({ ...formData, hasGarage: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-slate-700">Has Garage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasBalcony}
                  onChange={(e) => setFormData({ ...formData, hasBalcony: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-slate-700">Has Balcony</span>
              </label>
            </div>

            {/* Multi-Image Upload Section */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Property Images (up to 10)</label>
                <span className="text-xs text-slate-400">{uploadedImages.length}/10</span>
              </div>

              {/* Image Previews Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={img.signedUrl}
                        alt={`Property ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Main</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {uploadedImages.length < 10 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <p className="text-sm text-slate-500">Click to upload images</p>
                  <p className="text-xs text-slate-400">Select multiple files</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              {uploading && (
                <p className="text-sm text-primary mt-2 animate-pulse">Uploading...</p>
              )}
            </div>

            {/* Amenities Selection */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Amenities ({selectedAmenities.length} selected)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {dropdowns.amenities.map((amenity) => (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${selectedAmenities.includes(amenity.id)
                      ? "bg-primary/10 border-primary"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAmenities([...selectedAmenities, amenity.id]);
                        } else {
                          setSelectedAmenities(selectedAmenities.filter(id => id !== amenity.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{amenity.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit()} disabled={savePropertyMutation.isPending || uploading}>
              {savePropertyMutation.isPending ? "Saving..." : (editingProperty ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentListings;
