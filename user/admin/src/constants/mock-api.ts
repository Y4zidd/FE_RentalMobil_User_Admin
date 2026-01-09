
import { matchSorter } from 'match-sorter'; // For filtering
import apiClient from '@/lib/api-client';

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';

function normalizeImageUrl(url?: string | null) {
  if (!url) {
    return '';
  }

  try {
    if (!url.startsWith('http')) {
      return `${apiBaseUrl}${url}`;
    }

    const base = new URL(apiBaseUrl);
    const current = new URL(url);

    if (current.hostname === 'localhost') {
      current.hostname = base.hostname;
      current.port = base.port || current.port;
      current.protocol = base.protocol;
      return current.toString();
    }

    return url;
  } catch {
    return url;
  }
}

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
  partner_id?: number | string | null;
  province?: string | null;
  regency?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
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
      
      allProducts = allProducts.map((p: any) => {
        const rawLocation: string =
          typeof p.location === 'string'
            ? p.location
            : p.location?.name || p.location_name || '';

        const locationWithoutIndonesia = rawLocation.replace(
          /,\s*Indonesia\s*$/i,
          '',
        );

        const locationParts = locationWithoutIndonesia
          .split(',')
          .map((part: string) => part.trim())
          .filter((part: string) => part.length > 0);

        const cityFromPayload =
          p.location_city ||
          p.city ||
          (p.location && typeof p.location === 'object'
            ? p.location.city
            : null);

        let province: string | null =
          p.province != null ? String(p.province) : null;
        let regency: string | null =
          p.regency != null ? String(p.regency) : null;

        if (!province && locationParts.length >= 1) {
          province = locationParts[locationParts.length - 1];
        }

        if (!regency && locationParts.length >= 2) {
          regency = locationParts.slice(0, locationParts.length - 1).join(', ');
        }

        if (!regency && cityFromPayload) {
          regency = String(cityFromPayload);
        }

        const partnerPayload =
          p.partner ||
          p.rental_partner ||
          p.rentalPartner ||
          p.rental_partner_data;

        let partnerId: number | string | null = null;

        if (p.partner_id != null) {
          partnerId = p.partner_id;
        } else if (p.rental_partner_id != null) {
          partnerId = p.rental_partner_id;
        } else if (partnerPayload && typeof partnerPayload === 'object') {
          partnerId = partnerPayload.id ?? null;
        }

        return {
          ...p,
          photo_url: normalizeImageUrl(p.photo_url),
          location: rawLocation,
          price_per_day: Number(p.price_per_day),
          seating_capacity: Number(p.seating_capacity),
          year: Number(p.year),
          province,
          regency,
          location_latitude:
            p.location_latitude != null
              ? Number(p.location_latitude)
              : null,
          location_longitude:
            p.location_longitude != null
              ? Number(p.location_longitude)
              : null,
          images: p.images
            ? p.images.map((img: any) => ({
                ...img,
                image_url: normalizeImageUrl(img.image_url),
              }))
            : [],
          features: Array.isArray(p.features) ? p.features : [],
          partner_id: partnerId,
        };
      });

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

        const rawLocation: string =
          typeof product.location === 'string'
            ? product.location
            : product.location?.name || product.location_name || '';

        const locationWithoutIndonesia = rawLocation.replace(
          /,\s*Indonesia\s*$/i,
          '',
        );

        const locationParts = locationWithoutIndonesia
          .split(',')
          .map((part: string) => part.trim())
          .filter((part: string) => part.length > 0);

        const cityFromPayload =
          product.location_city ||
          product.city ||
          (product.location && typeof product.location === 'object'
            ? product.location.city
            : null);

        let province: string | null =
          product.province != null ? String(product.province) : null;
        let regency: string | null =
          product.regency != null ? String(product.regency) : null;

        if (!province && locationParts.length >= 1) {
          province = locationParts[locationParts.length - 1];
        }

        if (!regency && locationParts.length >= 2) {
          regency = locationParts
            .slice(0, locationParts.length - 1)
            .join(', ');
        }

        if (!regency && cityFromPayload) {
          regency = String(cityFromPayload);
        }

        const partnerPayload =
          product.partner ||
          product.rental_partner ||
          product.rentalPartner ||
          product.rental_partner_data;

        let partnerId: number | string | null = null;

        if (product.partner_id != null) {
          partnerId = product.partner_id;
        } else if (product.rental_partner_id != null) {
          partnerId = product.rental_partner_id;
        } else if (partnerPayload && typeof partnerPayload === 'object') {
          partnerId = partnerPayload.id ?? null;
        }

        product = {
          ...product,
          location: rawLocation,
          price_per_day: Number(product.price_per_day),
          seating_capacity: Number(product.seating_capacity),
          year: Number(product.year),
          province,
          regency,
          location_latitude:
            product.location_latitude != null
              ? Number(product.location_latitude)
              : null,
          location_longitude:
            product.location_longitude != null
              ? Number(product.location_longitude)
              : null,
          images: product.images
            ? product.images.map((img: any) => ({
                ...img,
                image_url: normalizeImageUrl(img.image_url),
              }))
            : [],
          features: Array.isArray(product.features) ? product.features : [],
          partner_id: partnerId,
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
