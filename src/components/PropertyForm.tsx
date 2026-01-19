import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { CopyPlus, Save, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Property } from "@/hooks/useProperties";
import { toast } from "sonner";

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (data: Omit<Property, "id"> & { galleryImages?: { key: string; sortOrder: number }[] }) => void;
  onCancel: () => void;
}

interface UploadedImage {
  key: string;
  signedUrl: string;
  sortOrder: number;
}

export const PropertyForm = ({ initialData, onSubmit, onCancel }: PropertyFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<Omit<Property, "id"> & { description?: string, shortDescription?: string }>({
    defaultValues: initialData || {
      image: "",
      type: "Apartment",
      purpose: "RENT",
      price: 0,
      sqm: 0,
      bedrooms: 1,
      bathrooms: 1,
      hasGarage: false,
      hasBalcony: false,
      description: "",
      shortDescription: "",
    },
  });

  const type = watch("type");
  const purpose = watch("purpose");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check max limit
    if (uploadedImages.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const res = await fetch("/api/upload/multiple", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      
      const newImages = data.images.map((img: any, idx: number) => ({
        ...img,
        sortOrder: uploadedImages.length + idx,
      }));

      setUploadedImages([...uploadedImages, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: any) => {
    // Include gallery images in submission
    onSubmit({
      ...data,
      galleryImages: uploadedImages.map((img, idx) => ({
        key: img.key,
        sortOrder: idx,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Image Upload Section */}
      <div className="space-y-3">
        <Label>Property Images (up to 10)</Label>
        
        {/* Upload Button */}
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || uploadedImages.length >= 10}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Images
              </>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            {uploadedImages.length}/10 images
          </span>
        </div>

        {/* Image Previews */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                <img
                  src={img.signedUrl}
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {uploadedImages.length === 0 && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload property images</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description / Bio</Label>
        <Textarea 
          id="description" 
          {...register("description")} 
          placeholder="Describe the property..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short Description (for Carousel)</Label>
        <Input 
          id="shortDescription" 
          {...register("shortDescription")} 
          placeholder="Brief summary (max 255 chars)..."
          maxLength={255}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title", { required: true })} placeholder="e.g. Luxury Villa" />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(val) => setValue("type", val as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="House">House</SelectItem>
              <SelectItem value="Villa">Villa</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Land">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Purpose</Label>
          <Select value={purpose} onValueChange={(val) => setValue("purpose", val as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RENT">Rent</SelectItem>
              <SelectItem value="SALE">Sale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" {...register("price", { valueAsNumber: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Area</Label>
          <Input id="area" {...register("area", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sqm">Size (m²)</Label>
          <Input id="sqm" type="number" {...register("sqm", { valueAsNumber: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input id="bedrooms" type="number" {...register("bedrooms", { valueAsNumber: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input id="bathrooms" type="number" {...register("bathrooms", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="garage"
            checked={watch("hasGarage")}
            onCheckedChange={(checked) => setValue("hasGarage", checked)}
          />
          <Label htmlFor="garage">Has Garage</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="balcony"
            checked={watch("hasBalcony")}
            onCheckedChange={(checked) => setValue("hasBalcony", checked)}
          />
          <Label htmlFor="balcony">Has Balcony</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading}>
          {initialData ? <Save className="w-4 h-4 mr-2" /> : <CopyPlus className="w-4 h-4 mr-2" />}
          {initialData ? "Save Changes" : "Create Property"}
        </Button>
      </div>
    </form>
  );
};
