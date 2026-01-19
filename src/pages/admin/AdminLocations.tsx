import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [cities, setCities] = useState<City[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // City dialog
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityName, setCityName] = useState("");

  // Location dialog
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationForm, setLocationForm] = useState({ name: "", cityId: "" });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/cities`).then((r) => r.json()),
      fetch(`${API_URL}/api/locations`).then((r) => r.json()),
    ]).then(([citiesData, locationsData]) => {
      setCities(citiesData);
      setLocations(locationsData);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    try {
      const url = editingCity
        ? `${API_URL}/api/cities/${editingCity.id}`
        : `${API_URL}/api/cities`;

      const res = await fetch(url, {
        method: editingCity ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cityName }),
      });

      if (res.ok) {
        toast.success(editingCity ? "City updated!" : "City created!");
        setIsCityDialogOpen(false);
        fetchData();
      }
    } catch {
      toast.error("Error saving city");
    }
  };

  const handleCityDelete = async (id: number) => {
    if (!confirm("Delete this city? All locations in this city will also be deleted.")) return;

    try {
      await fetch(`${API_URL}/api/cities/${id}`, { method: "DELETE" });
      toast.success("City deleted!");
      fetchData();
    } catch {
      toast.error("Failed to delete city");
    }
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
    try {
      const url = editingLocation
        ? `${API_URL}/api/locations/${editingLocation.id}`
        : `${API_URL}/api/locations`;

      const res = await fetch(url, {
        method: editingLocation ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locationForm.name,
          cityId: parseInt(locationForm.cityId),
        }),
      });

      if (res.ok) {
        toast.success(editingLocation ? "Location updated!" : "Location created!");
        setIsLocationDialogOpen(false);
        fetchData();
      }
    } catch {
      toast.error("Error saving location");
    }
  };

  const handleLocationDelete = async (id: number) => {
    if (!confirm("Delete this location?")) return;

    try {
      await fetch(`${API_URL}/api/locations/${id}`, { method: "DELETE" });
      toast.success("Location deleted!");
      fetchData();
    } catch {
      toast.error("Failed to delete location");
    }
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
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-3/4" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-1/4" /></td>
                      <td className="p-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                    </tr>
                  ))
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
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-full" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-full" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-full" /></td>
                      <td className="p-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                    </tr>
                  ))
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
            <Button onClick={handleCitySubmit}>{editingCity ? "Update" : "Create"}</Button>
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
            <Button onClick={handleLocationSubmit}>{editingLocation ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLocations;
