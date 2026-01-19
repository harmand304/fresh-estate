import { useEffect, useState } from "react";
import { API_URL } from "@/config";
import { Plus, Pencil, Trash2, Search, Upload, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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


interface Project {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  status: string;
  location: string | null;
  priceRange: string | null;
  bedRange: string | null;
  bathRange: string | null;
  sqftRange: string | null;
  propertyCount: number;
}

interface FormData {
  name: string;
  description: string;
  image: string;
  status: string;
  location: string;
  priceRange: string;
  bedRange: string;
  bathRange: string;
  sqftRange: string;
}

const statusOptions = [
  { value: 'PRE_SELLING', label: 'Pre-Selling' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'HOT_DEAL', label: 'Hot Deal' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'RESALE', label: 'Resale' },
  { value: 'COMING_SOON', label: 'Coming Soon' },
];

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    image: "",
    status: "PRE_SELLING",
    location: "",
    priceRange: "",
    bedRange: "",
    bathRange: "",
    sqftRange: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects`);
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      status: "PRE_SELLING",
      location: "",
      priceRange: "",
      bedRange: "",
      bathRange: "",
      sqftRange: "",
    });
    setImagePreview(null);
    setEditingId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description || "",
      image: "",
      status: project.status,
      location: project.location || "",
      priceRange: project.priceRange || "",
      bedRange: project.bedRange || "",
      bathRange: project.bathRange || "",
      sqftRange: project.sqftRange || "",
    });
    setImagePreview(project.image);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const res = await fetch(`${API_URL}/api/upload?type=projects`, {
        method: 'POST',
        body: formDataUpload
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.key }));
        setImagePreview(data.signedUrl);
        toast.success('Image uploaded');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/api/admin/projects/${editingId}`
        : `${API_URL}/api/admin/projects`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          image: formData.image || null,
          status: formData.status,
          location: formData.location || null,
          priceRange: formData.priceRange || null,
          bedRange: formData.bedRange || null,
          bathRange: formData.bathRange || null,
          sqftRange: formData.sqftRange || null,
        })
      });

      if (res.ok) {
        toast.success(editingId ? 'Project updated' : 'Project created');
        setDialogOpen(false);
        resetForm();
        fetchProjects();
      } else {
        toast.error('Failed to save project');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save project');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/projects/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Project deleted');
        fetchProjects();
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(o => o.value === status);
    const colors: Record<string, string> = {
      PRE_SELLING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      HOT_DEAL: 'bg-red-100 text-red-700',
      COMMERCIAL: 'bg-orange-100 text-orange-700',
      RESALE: 'bg-purple-100 text-purple-700',
      COMING_SOON: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {option?.label || status}
      </span>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500">Manage property development projects</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Image */}
              <div className="h-40 bg-slate-100 relative">
                {project.image ? (
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(project.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-slate-900 mb-1">{project.name}</h3>
                {project.location && (
                  <p className="text-sm text-slate-500 mb-2">{project.location}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <span>{project.propertyCount} properties</span>
                  {project.priceRange && <span>{project.priceRange}</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(project)}
                    className="flex-1 gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                    className="gap-1"
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-slate-700">Project Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Golden City"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Project description..."
                rows={3}
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-slate-700">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Downtown, Erbil"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-slate-700">Price Range</label>
              <Input
                value={formData.priceRange}
                onChange={(e) => setFormData(prev => ({ ...prev, priceRange: e.target.value }))}
                placeholder="e.g., $2.4M+"
              />
            </div>

            {/* Bed/Bath/Sqft Ranges */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Bed Range</label>
                <Input
                  value={formData.bedRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, bedRange: e.target.value }))}
                  placeholder="2-4 Beds"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Bath Range</label>
                <Input
                  value={formData.bathRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, bathRange: e.target.value }))}
                  placeholder="2-3 Baths"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Sqft Range</label>
                <Input
                  value={formData.sqftRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, sqftRange: e.target.value }))}
                  placeholder="1,200+ sqft"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-slate-700">Cover Image</label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-40 h-28 object-cover rounded-lg" />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-40 h-28 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <span className="text-sm text-slate-500">Uploading...</span>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-500">Upload Image</span>
                      </div>
                    )}
                  </label>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Create'} Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
