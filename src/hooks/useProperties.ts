import { useQuery } from "@tanstack/react-query";
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

import { API_URL } from "@/config";

const fetchProperties = async (): Promise<Property[]> => {
  const response = await fetch(`${API_URL}/api/properties`);

  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  } else {
    console.warn("Properties data is not an array:", data);
    return [];
  }
};

export const useProperties = () => {
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
    retry: 2,
  });

  // Show error toast if fetch fails
  if (error) {
    console.error("Failed to fetch properties:", error);
    toast.error("Failed to load property data. Make sure the API server is running.");
  }

  return {
    properties,
    loading: isLoading,
  };
};
