import { useEffect, useState, useRef } from "react";
import { API_URL } from "@/config";
import { Plus, Pencil, Trash2, Search, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { compressImages } from "@/utils/compressImage";

interface Property {
  id: string;
  title: string;
  price: number;
  purpose: string;
  sqm: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  area: string;
  type: string;
  image: string;
  imageKey?: string;
  locationId: number | null;
  agentId: number | null;
  propertyTypeId: number | null;
}

interface FormData {
  title: string;
  description: string;
  shortDescription: string;
  price: string;
  purpose: string;
  sqm: string;
  bedrooms: string;
  bathrooms: string;
  hasGarage: boolean;
  hasBalcony: boolean;
  imageKey: string;
  locationId: string;
  agentId: string;
  propertyTypeId: string;
}

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
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
    sqm: "",
    bedrooms: "",
    bathrooms: "",
    hasGarage: false,
    hasBalcony: false,
    imageKey: "",
    locationId: "",
    agentId: "",
    propertyTypeId: "",
  });

  const fetchProperties = () => {
    setLoading(true);
    fetch(`${API_URL}/api/properties`)
      .then((res) => res.json())
      .then((data) => {
        setProperties(data);
        setLoading(false);
      });
  };

  const fetchDropdowns = () => {
    Promise.all([
      fetch(`${API_URL}/api/locations`).then((r) => r.json()),
      fetch(`${API_URL}/api/agents`).then((r) => r.json()),
      fetch(`${API_URL}/api/property-types`).then((r) => r.json()),
      fetch(`${API_URL}/api/amenities`).then((r) => r.json()),
    ]).then(([locs, agts, types, ams]) => {
      setLocations(locs);
      setAgents(agts);
      setPropertyTypes(types);
      setAmenities(ams);
    });
  };

  useEffect(() => {
    fetchProperties();
    fetchDropdowns();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      price: "",
      purpose: "SALE",
      sqm: "",
      bedrooms: "",
      bathrooms: "",
      hasGarage: false,
      hasBalcony: false,
      imageKey: "",
      locationId: "",
      agentId: "",
      propertyTypeId: "",
    });
    setEditingProperty(null);
    setUploadedImages([]);
    setSelectedAmenities([]);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };


  const openEditDialog = async (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: (property as any).description || "",
      shortDescription: (property as any).shortDescription || "",
      price: property.price.toString(),
      purpose: property.purpose,
      sqm: property.sqm?.toString() || "",
      bedrooms: property.bedrooms?.toString() || "",
      bathrooms: property.bathrooms?.toString() || "",
      hasGarage: false,
      hasBalcony: false,
      imageKey: property.imageKey || "",
      locationId: property.locationId?.toString() || "",
      agentId: property.agentId?.toString() || "",
      propertyTypeId: property.propertyTypeId?.toString() || "",
    });

    // Fetch all images, description, and amenities for this property
    try {
      const res = await fetch(`${API_URL}/api/properties/${property.id}`);
      const data = await res.json();

      // Update description from API
      if (data.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
      }
      if (data.shortDescription) {
        setFormData(prev => ({ ...prev, shortDescription: data.shortDescription }));
      }

      // Load images
      if (data.images && data.images.length > 0 && data.imageKeys) {
        // Map images with their database IDs for deletion
        const imagesWithIds = data.images.map((url: string, idx: number) => ({
          key: data.imageKeys[idx]?.key || '',
          signedUrl: url,
          dbId: data.imageKeys[idx]?.id // Store DB id for deletion
        }));
        setUploadedImages(imagesWithIds);
      } else if (property.image) {
        setUploadedImages([{ key: property.imageKey || '', signedUrl: property.image }]);
      } else {
        setUploadedImages([]);
      }

      // Load amenities
      if (data.amenities && data.amenities.length > 0) {
        setSelectedAmenities(data.amenities.map((a: any) => a.id));
      } else {
        setSelectedAmenities([]);
      }
    } catch {
      // Fallback to single image
      setUploadedImages(property.image ? [{ key: property.imageKey || '', signedUrl: property.image }] : []);
      setSelectedAmenities([]);
    }

    setIsDialogOpen(true);
  };

  // Handle multiple image file selection and upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check max limit
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
        // Set first image as main imageKey
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

    // Delete from database if it has a dbId
    if (imageToRemove.dbId) {
      try {
        await fetch(`${API_URL}/api/admin/property-images/${imageToRemove.dbId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    // Update main imageKey to first remaining image
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
      sqm: parseInt(formData.sqm) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      hasGarage: formData.hasGarage,
      hasBalcony: formData.hasBalcony,
      image: uploadedImages[0]?.key || formData.imageKey || null,
      locationId: formData.locationId ? parseInt(formData.locationId) : null,
      agentId: formData.agentId ? parseInt(formData.agentId) : null,
      propertyTypeId: formData.propertyTypeId ? parseInt(formData.propertyTypeId) : null,
    };

    try {
      const url = editingProperty
        ? `${API_URL}/api/properties/${editingProperty.id}`
        : `${API_URL}/api/properties`;

      const res = await fetch(url, {
        method: editingProperty ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const propertyData = await res.json();
        const propertyId = propertyData.id || editingProperty?.id;

        // Save only NEW images to property_images table (skip existing ones with dbId)
        const newImages = uploadedImages.filter(img => !img.dbId);
        if (newImages.length > 0 && propertyId) {
          const imagesPayload = newImages.map((img, idx) => ({
            key: img.key,
            sortOrder: uploadedImages.findIndex(i => i.key === img.key) // Keep original order
          }));

          await fetch(`${API_URL}/api/admin/properties/${propertyId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: imagesPayload }),
          });
        }

        // Save amenities to property
        if (selectedAmenities.length > 0 && propertyId) {
          await fetch(`${API_URL}/api/admin/properties/${propertyId}/amenities`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amenityIds: selectedAmenities }),
          });
        }

        toast.success(editingProperty ? "Property updated!" : "Property created!");
        setIsDialogOpen(false);
        fetchProperties();
        resetForm();
      } else {
        toast.error("Failed to save property");
      }
    } catch {
      toast.error("Error saving property");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const res = await fetch(`${API_URL}/api/properties/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Property deleted!");
        fetchProperties();
      }
    } catch {
      toast.error("Failed to delete property");
    }
  };

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Properties</h1>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" /> Add Property
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-medium text-slate-600">Title</th>
              <th className="text-left p-4 font-medium text-slate-600">City</th>
              <th className="text-left p-4 font-medium text-slate-600">Type</th>
              <th className="text-left p-4 font-medium text-slate-600">Purpose</th>
              <th className="text-left p-4 font-medium text-slate-600">Price</th>
              <th className="text-right p-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="p-4"><Skeleton className="h-4 w-full" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-full" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-full" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-full" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-full" /></td>
                  <td className="p-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                </tr>
              ))
            ) : filteredProperties.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No properties found
                </td>
              </tr>
            ) : (
              filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {property.image && (
                        <img
                          src={property.image}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}
                      <span className="font-medium text-slate-800">{property.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{property.city}</td>
                  <td className="p-4 text-slate-600">{property.type}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${property.purpose === "SALE"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {property.purpose}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    ${property.price.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(property)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
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
                value={formData.sqm}
                onChange={(e) => setFormData({ ...formData, sqm: e.target.value })}
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
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name} ({loc.cityName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Agent</label>
              <Select
                value={formData.agentId}
                onValueChange={(v) => setFormData({ ...formData, agentId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
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
                  {propertyTypes.map((type) => (
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
                {amenities.map((amenity) => (
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
            <Button onClick={handleSubmit} disabled={uploading}>
              {editingProperty ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProperties;
