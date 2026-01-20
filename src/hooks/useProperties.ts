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


export interface PropertyFilters {
  city?: string;
  purpose?: string;
  type?: string;
  bedrooms?: string;
  bathrooms?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PropertiesResponse {
  properties: Property[];
  pagination: PaginationMeta;
}

const fetchProperties = async (filters: PropertyFilters = {}): Promise<PropertiesResponse> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_URL}/api/properties?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }

  const data = await response.json();
  return data;
};

export const useProperties = (filters: PropertyFilters = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    retry: 1,
    placeholderData: (previousData) => previousData, // Keep data while fetching new page
  });

  // Show error toast if fetch fails
  if (error) {
    console.error("Failed to fetch properties:", error);
    toast.error("Failed to load property data. Make sure the API server is running.");
  }

  return {
    properties: data?.properties || [],
    pagination: data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 },
    loading: isLoading,
  };
};
