import { useState } from "react";
import { API_URL } from "@/config";
import { Plus, Pencil, Trash2, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface City {
  id: number;
  name: string;
  locationCount: number;
}

interface Location {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
  propertyCount: number;
}

const AdminLocations = () => {
  const queryClient = useQueryClient();

  // City dialog
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityName, setCityName] = useState("");

  // Location dialog
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationForm, setLocationForm] = useState({ name: "", cityId: "" });

  const { data: cities = [], isLoading: loadingCities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/cities`);
      return res.json() as Promise<City[]>;
    }
  });

  const { data: locations = [], isLoading: loadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/locations`);
      return res.json() as Promise<Location[]>;
    }
  });

  const loading = loadingCities || loadingLocations;

  // City Mutations
  const cityMutation = useMutation({
    mutationFn: async (payload: { name: string }) => {
      const url = editingCity
        ? `${API_URL}/api/cities/${editingCity.id}`
        : `${API_URL}/api/cities`;

      const res = await fetch(url, {
        method: editingCity ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error saving city");
      return res.json();
    },
    onSuccess: () => {
      toast.success(editingCity ? "City updated!" : "City created!");
      setIsCityDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
    onError: () => {
      toast.error("Error saving city");
    }
  });

  const cityDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/api/cities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete city");
    },
    onSuccess: () => {
      toast.success("City deleted!");
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] }); // Locations in that city might be gone
    },
    onError: () => {
      toast.error("Failed to delete city");
    }
  });

  // Location Mutations
  const locationMutation = useMutation({
    mutationFn: async (payload: { name: string; cityId: number }) => {
      const url = editingLocation
        ? `${API_URL}/api/locations/${editingLocation.id}`
        : `${API_URL}/api/locations`;

      const res = await fetch(url, {
        method: editingLocation ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error saving location");
      return res.json();
    },
    onSuccess: () => {
      toast.success(editingLocation ? "Location updated!" : "Location created!");
      setIsLocationDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] }); // Update counts
    },
    onError: () => {
      toast.error("Error saving location");
    }
  });

  const locationDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/api/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete location");
    },
    onSuccess: () => {
      toast.success("Location deleted!");
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
    onError: () => {
      toast.error("Failed to delete location");
    }
  });


  // City handlers
  const openAddCityDialog = () => {
    setEditingCity(null);
    setCityName("");
    setIsCityDialogOpen(true);
  };

  const openEditCityDialog = (city: City) => {
    setEditingCity(city);
    setCityName(city.name);
    setIsCityDialogOpen(true);
  };

  const handleCitySubmit = async () => {
    cityMutation.mutate({ name: cityName });
  };

  const handleCityDelete = async (id: number) => {
    if (!confirm("Delete this city? All locations in this city will also be deleted.")) return;
    cityDeleteMutation.mutate(id);
  };

  // Location handlers
  const openAddLocationDialog = () => {
    setEditingLocation(null);
    setLocationForm({ name: "", cityId: "" });
    setIsLocationDialogOpen(true);
  };

  const openEditLocationDialog = (location: Location) => {
    setEditingLocation(location);
    setLocationForm({ name: location.name, cityId: location.cityId.toString() });
    setIsLocationDialogOpen(true);
  };

  const handleLocationSubmit = async () => {
    locationMutation.mutate({
      name: locationForm.name,
      cityId: parseInt(locationForm.cityId),
    });
  };

  const handleLocationDelete = async (id: number) => {
    if (!confirm("Delete this location?")) return;
    locationDeleteMutation.mutate(id);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Locations</h1>

      <Tabs defaultValue="cities" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="cities" className="gap-2">
            <Globe className="w-4 h-4" /> Cities
          </TabsTrigger>
          <TabsTrigger value="locations" className="gap-2">
            <MapPin className="w-4 h-4" /> Areas/Neighborhoods
          </TabsTrigger>
        </TabsList>

        {/* Cities Tab */}
        <TabsContent value="cities">
          <div className="flex justify-end mb-4">
            <Button onClick={openAddCityDialog} className="gap-2">
              <Plus className="w-4 h-4" /> Add City
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">City Name</th>
                  <th className="text-left p-4 font-medium text-slate-600">Locations</th>
                  <th className="text-right p-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : cities.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">No cities found</td>
                  </tr>
                ) : (
                  cities.map((city) => (
                    <tr key={city.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{city.name}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                          {city.locationCount} locations
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditCityDialog(city)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCityDelete(city.id)}
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
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations">
          <div className="flex justify-end mb-4">
            <Button onClick={openAddLocationDialog} className="gap-2">
              <Plus className="w-4 h-4" /> Add Location
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">Location Name</th>
                  <th className="text-left p-4 font-medium text-slate-600">City</th>
                  <th className="text-left p-4 font-medium text-slate-600">Properties</th>
                  <th className="text-right p-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : locations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No locations found</td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr key={location.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{location.name}</td>
                      <td className="p-4 text-slate-600">{location.cityName}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-sm">
                          {location.propertyCount} properties
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditLocationDialog(location)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLocationDelete(location.id)}
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
        </TabsContent>
      </Tabs>

      {/* City Dialog */}
      <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCity ? "Edit City" : "Add New City"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-slate-700">City Name</label>
            <Input
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="City name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCityDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCitySubmit} disabled={cityMutation.isPending}>
              {cityMutation.isPending ? "Saving..." : (editingCity ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLocation ? "Edit Location" : "Add New Location"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Location Name</label>
              <Input
                value={locationForm.name}
                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                placeholder="Location/Area name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">City</label>
              <Select
                value={locationForm.cityId}
                onValueChange={(v) => setLocationForm({ ...locationForm, cityId: v })}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLocationSubmit} disabled={locationMutation.isPending}>
              {locationMutation.isPending ? "Saving..." : (editingLocation ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLocations;
