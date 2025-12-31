import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface Property {
  id: string;
  image: string;
  title: string;
  type: "Apartment" | "House" | "Villa" | "Office" | "Commercial" | "Land" | "Plot";
  purpose: "RENT" | "SALE";
  price: number;
  city: string;
  area: string;
  sqm: number;
  bedrooms: number;
  bathrooms: number;
  hasGarage?: boolean;
  hasBalcony?: boolean;
  agent?: string;
  agentId?: number;
  agentPhone?: string;
  description?: string;
  shortDescription?: string;
}

const API_URL = `http://${window.location.hostname}:3001/api`;

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await fetch(`${API_URL}/properties`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        
        const data = await response.json();
        if (Array.isArray(data)) {
          setProperties(data);
        } else {
          console.warn("Properties data is not an array:", data);
          setProperties([]);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        toast.error("Failed to load property data. Make sure the API server is running.");
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const addProperty = async (property: Omit<Property, "id">) => {
    // For now, just add locally - can implement POST endpoint later
    const newProperty = { ...property, id: crypto.randomUUID() };
    setProperties(prev => [newProperty, ...prev]);
    toast.success("Property added successfully");
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    const updated = properties.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProperties(updated);
    toast.success("Property updated successfully");
  };

  const deleteProperty = (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    setProperties(updated);
    toast.success("Property deleted successfully");
  };

  return { properties, addProperty, updateProperty, deleteProperty, loading };
};
