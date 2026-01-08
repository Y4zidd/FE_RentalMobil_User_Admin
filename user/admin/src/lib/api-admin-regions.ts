import apiClient from './api-client';

type RegionItem = {
  id: number;
  name: string;
};

export const fetchAdminRegionsProvinces = async (): Promise<RegionItem[]> => {
  const res = await apiClient.get('/api/regions/provinces');
  const raw = res.data as any;
  const data = (Array.isArray(raw) ? raw : raw?.data || []) as RegionItem[];
  return data;
};

export const fetchAdminRegionsRegenciesByProvince = async (
  provinceId: number
): Promise<RegionItem[]> => {
  const res = await apiClient.get(
    `/api/regions/provinces/${provinceId}/regencies`
  );
  const raw = res.data as any;
  const data = (Array.isArray(raw) ? raw : raw?.data || []) as RegionItem[];
  return data;
};

