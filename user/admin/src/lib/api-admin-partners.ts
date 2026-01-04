import apiClient from './api-client';

export type AdminRentalPartner = {
  id: number;
  name: string;
  country: string;
  province?: string | null;
  regency?: string | null;
  city?: string | null;
  address?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  status: 'active' | 'inactive';
};

export async function fetchAdminRentalPartners(): Promise<AdminRentalPartner[]> {
  const res = await apiClient.get('/api/admin/rental-partners');
  const raw = Array.isArray(res.data) ? res.data : res.data.data || [];
  return raw as AdminRentalPartner[];
}

export async function createAdminRentalPartner(
  payload: Partial<AdminRentalPartner>
): Promise<AdminRentalPartner> {
  const res = await apiClient.post('/api/admin/rental-partners', payload);
  return res.data as AdminRentalPartner;
}

export async function updateAdminRentalPartner(
  id: number,
  payload: Partial<AdminRentalPartner>
): Promise<AdminRentalPartner> {
  const res = await apiClient.put(`/api/admin/rental-partners/${id}`, payload);
  return res.data as AdminRentalPartner;
}

export async function deleteAdminRentalPartner(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/rental-partners/${id}`);
}

