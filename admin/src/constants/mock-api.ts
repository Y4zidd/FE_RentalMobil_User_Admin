
import { matchSorter } from 'match-sorter'; // For filtering
import apiClient from '@/lib/api-client';

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Define the shape of Product data
export type Product = {
  photo_url: string;
  name: string; // Display name (e.g. Brand + Model)
  description: string;
  features?: string[];
  images?: {
    id: number;
    image_url: string;
    is_primary?: boolean;
    sort_order?: number;
  }[];
  created_at: string;
  price_per_day: number; // Renamed from price to match User FE/Docs
  id: number;
  status: string; // available, rented, maintenance
  category: string; // SUV, Sedan, MPV, etc.
  brand: string;
  model: string;
  year: number;
  location: string;
  fuel_type: string;
  transmission: string;
  seating_capacity: number; // Renamed from capacity to match User FE/Docs
  license_plate: string;
  updated_at: string;
};

// Mock product data store replaced with Real API
export const fakeProducts = {
  // Get paginated results with optional category filtering and search
  async getProducts({
    page = 1,
    limit = 10,
    categories,
    search
  }: {
    page?: number;
    limit?: number;
    categories?: string;
    search?: string;
  }) {
    // Construct query params
    const params: any = {
      page,
      limit, // API might need 'per_page'
      search
    };
    if (categories) {
      params.category = categories;
    }

    try {
      const response = await apiClient.get('/api/admin/cars', { params });
      // Assume Laravel returns standard pagination or just a list
      // If it's a list, we simulate pagination here or fix backend.
      // Based on CarController, it returns all cars: return response()->json($cars);
      
      let allProducts = response.data;
      if (response.data.data) {
          allProducts = response.data.data; // Handle pagination if present
      }
      
      // Map backend response to Frontend Product type
      allProducts = allProducts.map((p: any) => ({
          ...p,
          location: p.location?.name || 'Unknown', // Flatten location object to string
          price_per_day: Number(p.price_per_day), // Ensure number
          seating_capacity: Number(p.seating_capacity), // Ensure number
          year: Number(p.year) // Ensure number
      }));

      if (categories) {
        const categoriesArray = categories
          .split(',')
          .map((value: string) => value.trim())
          .filter((value: string) => value.length > 0);
        if (categoriesArray.length > 0) {
          allProducts = allProducts.filter((product: any) =>
            categoriesArray.includes(product.category)
          );
        }
      }
      
      if (search) {
        allProducts = matchSorter(allProducts, search, {
            keys: ['name', 'description', 'category', 'brand', 'model']
        });
      }

      const totalProducts = allProducts.length;
      const offset = (page - 1) * limit;
      const paginatedProducts = allProducts.slice(offset, offset + limit);
      const currentTime = new Date().toISOString();

      return {
        success: true,
        time: currentTime,
        message: 'Data fetched from API',
        total_products: totalProducts,
        offset,
        limit,
        products: paginatedProducts
      };

    } catch (error) {
      console.error("Failed to fetch products", error);
      return {
        success: false,
        message: 'Failed to fetch products',
        total_products: 0,
        offset: 0,
        limit,
        products: []
      };
    }
  },

  // Get a specific product by its ID
  async getProductById(id: number) {
    try {
        const response = await apiClient.get(`/api/admin/cars/${id}`);
        let product = response.data;
        
        // Map backend response
        product = {
            ...product,
            location: product.location?.name || 'Unknown',
            price_per_day: Number(product.price_per_day),
            seating_capacity: Number(product.seating_capacity),
            year: Number(product.year),
            images: product.images || []
        };

        const currentTime = new Date().toISOString();
        return {
            success: true,
            time: currentTime,
            message: `Product with ID ${id} found`,
            product
        };
    } catch (error) {
        return {
            success: false,
            message: `Product with ID ${id} not found`
        };
    }
  }
};
