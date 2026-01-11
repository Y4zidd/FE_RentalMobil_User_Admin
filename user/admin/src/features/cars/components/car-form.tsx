'use client';

import GalleryUpload from '@/components/gallery-upload';
import { FileMetadata } from '@/hooks/use-file-upload';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/constants/mock-api';
import type { FormOption } from '@/types/base-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  FUEL_TYPE_OPTIONS,
  STATUS_OPTIONS,
  TRANSMISSION_OPTIONS
} from './product-tables/options';
import {
  Map,
  MapClickHandler,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl
} from '@/components/ui/map';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { createAdminCar, updateAdminCar } from '@/lib/api-admin-cars';
import { fetchUserProfile } from '@/lib/api-admin-auth';
import {
  fetchAdminRegionsProvinces,
  fetchAdminRegionsRegenciesByProvince
} from '@/lib/api-admin-regions';
import { fetchAdminRentalPartners } from '@/lib/api-admin-partners';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const INDONESIA_DEFAULT_CENTER: [number, number] = [-2, 115];

const formSchema = z.object({
  image: z
    .array(z.any())
    .optional()
    .refine(
      (files) =>
        !files ||
        files.every(
          (file) => file && typeof file.size === 'number' && file.size <= MAX_FILE_SIZE
        ),
      `Max file size is 5MB per image.`
    )
    .refine(
      (files) =>
        !files ||
        files.every(
          (file) => file && ACCEPTED_IMAGE_TYPES.includes(file.type as string)
        ),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  name: z.string().min(2, {
    message: 'Car name must be at least 2 characters.'
  }),
  brand: z.string().min(2, {
    message: 'Brand must be at least 2 characters.'
  }),
  model: z.string().min(2, {
    message: 'Model must be at least 2 characters.'
  }),
  licensePlate: z.string().min(2, {
    message: 'License plate is required.'
  }),
  pricePerDay: z.number().min(0, {
    message: 'Price must be a positive number.'
  }),
  seatingCapacity: z.number().min(1, {
    message: 'Capacity must be at least 1.'
  }),
  year: z.number().min(1900, {
    message: 'Year must be valid.'
  }),
  category: z.string().min(1, {
    message: 'Category is required.'
  }),
  transmission: z.string().min(1, {
    message: 'Transmission is required.'
  }),
  fuelType: z.string().min(1, {
    message: 'Fuel type is required.'
  }),
  province: z.string().min(1, {
    message: 'Province or region is required.'
  }),
  regency: z.string().min(1, {
    message: 'Regency is required.'
  }),
  partnerId: z.string().optional(),
  status: z.string().min(1, {
    message: 'Status is required.'
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.'
  }),
  features: z.array(z.string())
});

type CarFormValues = z.infer<typeof formSchema>;

export default function CarForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null
  );
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const geocodeControllerRef = useRef<AbortController | null>(null);
  const pendingRegencyNameRef = useRef<string | null>(null);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile().then(setCurrentUser).catch(() => {});
  }, []);

  const parsedLocation = (() => {
    const rawLocation = initialData?.location || '';
    if (!rawLocation) {
      return {
        province: '',
        regency: ''
      };
    }

    const withoutIndonesia = rawLocation.replace(/,\s*Indonesia\s*$/i, '');
    const parts = withoutIndonesia
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length === 0) {
      return {
        province: '',
        regency: ''
      };
    }

    if (parts.length === 1) {
      return {
        province: parts[0],
        regency: ''
      };
    }

    const province = parts[parts.length - 1];
    const regency = parts.slice(0, parts.length - 1).join(', ');

    return {
      province,
      regency
    };
  })();

  const prevProvinceRef = useRef(parsedLocation.province);
  const initialPartnerIdRef = useRef(
    initialData?.partner_id ? String(initialData.partner_id) : ''
  );
  const hasHandledInitialPartnerEffectRef = useRef(false);
  const shouldSkipFirstGeocodeRef = useRef(
    initialData?.location_latitude != null &&
      initialData?.location_longitude != null
  );

  const defaultValues = {
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    licensePlate: initialData?.license_plate || '',
    pricePerDay: initialData?.price_per_day || 0,
    seatingCapacity: initialData?.seating_capacity || 1,
    transmission: initialData?.transmission || '',
    fuelType: initialData?.fuel_type || '',
    province: initialData?.province || parsedLocation.province,
    regency: initialData?.regency || parsedLocation.regency,
    partnerId: initialData?.partner_id ? String(initialData.partner_id) : '',
    year: initialData?.year || new Date().getFullYear(),
    category: initialData?.category || '',
    status: initialData?.status || 'available',
    description: initialData?.description || '',
    features: initialData?.features || []
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const selectedProvince = form.watch('province');
  const selectedRegency = form.watch('regency');
  const selectedPartnerId = form.watch('partnerId');
  const initialGalleryFiles: FileMetadata[] = (initialData?.images ?? []).map(
    (img) => ({
      id: String(img.id),
      name: `Image ${img.id}`,
      size: 0,
      type: 'image/jpeg',
      url: img.image_url
    })
  );

  useEffect(() => {
    if (
      initialData?.location_latitude != null &&
      initialData?.location_longitude != null
    ) {
      const lat = Number(initialData.location_latitude);
      const lng = Number(initialData.location_longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        const center: [number, number] = [lat, lng];
        setMapCenter(center);
        setMarkerPosition(center);
      }
    }
  }, [initialData]);

  useEffect(() => {
    const query = selectedRegency
      ? `${selectedRegency}, ${selectedProvince}, Indonesia`
      : selectedProvince
        ? `${selectedProvince}, Indonesia`
        : '';

    if (!query) {
      return;
    }

    let isMounted = true;

    const geocode = async () => {
      try {
        setIsGeocodingLocation(true);

        if (geocodeControllerRef.current) {
          try {
            geocodeControllerRef.current.abort();
          } catch {
          }
        }

        const controller = new AbortController();
        geocodeControllerRef.current = controller;

        const response = await fetch(
          'https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1&viewbox=' +
            encodeURIComponent('94,6,141,-11') +
            '&q=' +
            encodeURIComponent(query),
          { signal: controller.signal }
        );

        if (!response.ok) {
          return;
        }

        const results = await response.json();

        if (!isMounted || !Array.isArray(results) || results.length === 0) {
          return;
        }

        const first = results[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          return;
        }

        const center: [number, number] = [lat, lng];
        setMapCenter(center);
        setMarkerPosition(center);
      } catch {
      } finally {
        if (isMounted) {
          setIsGeocodingLocation(false);
        }
      }
    };

    if (shouldSkipFirstGeocodeRef.current) {
      shouldSkipFirstGeocodeRef.current = false;
      return;
    }

    geocode();

    return () => {
      isMounted = false;
      if (geocodeControllerRef.current) {
        try {
          geocodeControllerRef.current.abort();
        } catch {
        }
      }
    };
  }, [selectedProvince, selectedRegency]);

  const [provinceOptions, setProvinceOptions] = useState<FormOption[]>([]);
  const [regencyOptions, setRegencyOptions] = useState<FormOption[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<FormOption[]>([]);
  const [partnerRegionMap, setPartnerRegionMap] = useState<
    Record<string, { province?: string | null; regency?: string | null }>
  >({});
  const [provinceIdMap, setProvinceIdMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      try {
        const data = await fetchAdminRegionsProvinces();
        if (!isMounted) return;
        const idMap: Record<string, number> = {};
        const options: FormOption[] = data.map((p) => {
          const proper = p.name
            .toLowerCase()
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          idMap[proper] = p.id;
          return { value: proper, label: proper };
        });
        setProvinceIdMap(idMap);
        setProvinceOptions(options);
      } catch {}
    };
    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadRegencies = async () => {
      if (selectedProvince !== prevProvinceRef.current) {
        form.setValue('regency', '');
        prevProvinceRef.current = selectedProvince;
      }
      setRegencyOptions([]);
      const id = provinceIdMap[selectedProvince || ''];
      if (!id) return;
      try {
        const data = await fetchAdminRegionsRegenciesByProvince(id);
        if (!isMounted) return;
        const options: FormOption[] = data.map((c) => {
          const proper = c.name
            .toLowerCase()
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          return { value: proper, label: proper };
        });
        setRegencyOptions(options);
      } catch {}
    };
    loadRegencies();
    return () => {
      isMounted = false;
    };
  }, [selectedProvince, provinceIdMap]);

  useEffect(() => {
    if (!pendingRegencyNameRef.current || regencyOptions.length === 0) {
      return;
    }

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const target = normalize(pendingRegencyNameRef.current);

    const match = regencyOptions.find(
      (option) =>
        option.value === target ||
        option.label.toLowerCase().includes(target.toLowerCase())
    );

    if (match) {
      form.setValue('regency', match.value, {
        shouldValidate: true
      });
    }

    pendingRegencyNameRef.current = null;
  }, [regencyOptions, form]);

  useEffect(() => {
    let isMounted = true;
    const loadPartners = async () => {
      try {
        const data = await fetchAdminRentalPartners();
        if (!isMounted) return;

        const regionMap: Record<
          string,
          { province?: string | null; regency?: string | null }
        > = {};

        const options: FormOption[] = data.map((p) => {
          const regionParts = [];
          if (p.regency) regionParts.push(p.regency);
          if (p.province) regionParts.push(p.province);
          const region = regionParts.join(', ');
          const label = region ? `${p.name} — ${region}` : p.name;

          regionMap[String(p.id)] = {
            province: p.province ?? null,
            regency: p.regency ?? null
          };

          return { value: String(p.id), label };
        });

        setPartnerOptions(options);
        setPartnerRegionMap(regionMap);
      } catch {
      }
    };
    loadPartners();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPartnerId) {
      return;
    }

    const initialPartnerId = initialPartnerIdRef.current;
    const currentRegency = form.getValues('regency');
    const isInitialPartner =
      initialPartnerId &&
      String(selectedPartnerId) === String(initialPartnerId);

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const region = partnerRegionMap[String(selectedPartnerId)];

    let provinceName = '';
    let regencyName = '';

    if (region) {
      if (region.province) {
        provinceName = String(region.province);
      }
      if (region.regency) {
        regencyName = String(region.regency);
      }
    }

    const selectedPartnerOption = partnerOptions.find(
      (option) => option.value === String(selectedPartnerId)
    );

    if (!provinceName && selectedPartnerOption) {
      const labelParts = selectedPartnerOption.label.split('—');
      const regionText = labelParts[1]?.trim() || '';
      if (regionText) {
        const regionPieces = regionText.split(',').map((p) => p.trim());
        if (!provinceName) {
          provinceName = regionPieces[regionPieces.length - 1] || '';
        }
        if (!regencyName && regionPieces.length > 1) {
          regencyName = regionPieces.slice(0, regionPieces.length - 1).join(', ');
        }
      }
    }

    if (!provinceName && !regencyName) {
      return;
    }

    const normalizedProvince = provinceName ? normalize(provinceName) : '';

    let provinceOption = null as FormOption | null;

    if (normalizedProvince) {
      provinceOption =
        provinceOptions.find((option) => option.value === normalizedProvince) ||
        provinceOptions.find(
          (option) => normalize(option.value) === normalizedProvince
        ) ||
        provinceOptions.find(
          (option) => normalize(option.label) === normalizedProvince
        ) ||
        provinceOptions.find((option) =>
          option.label.toLowerCase().includes(provinceName.toLowerCase())
        ) ||
        null;
    }

    if (provinceOption) {
      form.setValue('province', provinceOption.value, {
        shouldValidate: true
      });
    }

    // Kasus 1: Edit dengan partner awal dan regency sudah ada -> jangan ubah apa-apa
    if (isInitialPartner && currentRegency) {
      hasHandledInitialPartnerEffectRef.current = true;
      return;
    }

    // Kasus 2: Edit dengan partner awal tapi regency kosong -> isi otomatis dari partner
    if (isInitialPartner && !currentRegency) {
      if (regencyName) {
        pendingRegencyNameRef.current = String(regencyName);
      }
      hasHandledInitialPartnerEffectRef.current = true;
      return;
    }

    // Kasus 3: User mengganti partner -> kosongkan regency supaya dipilih ulang
    hasHandledInitialPartnerEffectRef.current = true;
    form.setValue('regency', '');
    pendingRegencyNameRef.current = null;
  }, [
    selectedPartnerId,
    partnerRegionMap,
    partnerOptions,
    provinceOptions,
    form
  ]);

  const handleMapClick = async (position: [number, number]) => {
    const [lat, lng] = position;

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    setMapCenter(position);
    setMarkerPosition(position);

    try {
      if (geocodeControllerRef.current) {
        try {
          geocodeControllerRef.current.abort();
        } catch {
        }
      }

      const controller = new AbortController();
      geocodeControllerRef.current = controller;

      const response = await fetch(
        'https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&addressdetails=1&lat=' +
          encodeURIComponent(String(lat)) +
          '&lon=' +
          encodeURIComponent(String(lng)),
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'id,en'
          }
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const address = data?.address || {};

      const provinceCandidate =
        address.state || address.region || address.province || '';
      const regencyCandidate =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        '';

      if (!provinceCandidate) {
        return;
      }

      const normalizedProvince = normalize(String(provinceCandidate));

      const provinceOption = provinceOptions.find(
        (option) => option.value === normalizedProvince
      );

      if (!provinceOption) {
        return;
      }

      form.setValue('province', provinceOption.value, {
        shouldValidate: true
      });

      pendingRegencyNameRef.current = regencyCandidate
        ? String(regencyCandidate)
        : null;
    } catch {
    }
  };

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const formData = new FormData();

      const hasNewImages = Array.isArray(values.image) && values.image.length > 0;
      // For validation, we need at least one image (either new or existing)
      // We can check if initialGalleryFiles - deletedImages + newImages > 0
      // But calculating that here is tricky since we only have deletedImageIds.
      
      const remainingExistingCount = (initialData?.images?.length ?? 0) - deletedImageIds.length;
      const totalImages = remainingExistingCount + (values.image?.length ?? 0);

      if (totalImages === 0) {
        toast.error('Upload at least one car image');
        setLoading(false);
        return;
      }

      const payload = {
        name: values.name,
        brand: values.brand,
        model: values.model,
        license_plate: values.licensePlate,
        year: values.year,
        category: values.category,
        status: values.status,
        transmission: values.transmission,
        fuel_type: values.fuelType,
        seating_capacity: values.seatingCapacity,
        price_per_day: values.pricePerDay,
        location_name: `${values.regency}, ${values.province}`,
        location_city: values.regency,
        location_address: '',
        location_latitude: markerPosition ? markerPosition[0] : null,
        location_longitude: markerPosition ? markerPosition[1] : null,
        description: values.description
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (values.partnerId) {
        formData.append('partner_id', values.partnerId);
      }

      if (hasNewImages && values.image) {
        values.image.forEach((file) => {
          formData.append('images[]', file);
        });
      }

      if (values.features && values.features.length > 0) {
        values.features.forEach((feature) => {
          formData.append('features[]', feature);
        });
      }

      if (deletedImageIds.length > 0) {
        deletedImageIds.forEach((id) => {
          formData.append('deleted_image_ids[]', String(id));
        });
      }

      if (initialData) {
        await updateAdminCar(initialData.id, formData);
        toast.success('Car updated successfully');
      } else {
        await createAdminCar(formData);
        toast.success('Car created successfully');
      }

      router.push('/dashboard/cars');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const fieldErrors = error?.response?.data?.errors;

      if (error?.response?.status === 422 && fieldErrors) {
        if (fieldErrors.license_plate?.[0]) {
          const plateMessage =
            'This license plate is already used by another car.';

          form.setError('licensePlate', {
            type: 'server',
            message: plateMessage
          });

          toast.error(plateMessage);
          return;
        }

        const firstError =
          (Object.values(fieldErrors as any)[0] as any)?.[0] ||
          'Validation error';
        toast.error(firstError);
      } else {
        const message =
          error?.response?.data?.message ||
          'Something went wrong';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8'
        >
          <FormField
            control={form.control}
            name='image'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Car Images</FormLabel>
                <FormControl>
                  <GalleryUpload
                    initialFiles={initialGalleryFiles}
                    onFilesChange={(files) => {
                      const newFiles = files
                        .map((f) => f.file)
                        .filter((f): f is File => f instanceof File);
                      field.onChange(newFiles);

                      const currentIds = files.map((f) => f.id);
                      const originalIds = (initialData?.images ?? []).map((i) =>
                        String(i.id)
                      );
                      const deleted = originalIds
                        .filter((id) => !currentIds.includes(id))
                        .map(Number);
                      setDeletedImageIds(deleted);
                    }}
                    maxFiles={8}
                    maxSize={5 * 1024 * 1024}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Basic Details</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput<CarFormValues>
                control={form.control}
                name='name'
                label='Car Name'
                placeholder='e.g. Toyota Avanza 1.5 G'
                required
              />
              <FormInput<CarFormValues>
                control={form.control}
                name='brand'
                label='Brand'
                placeholder='e.g. Toyota'
                required
              />
              <FormInput<CarFormValues>
                control={form.control}
                name='model'
                label='Model'
                placeholder='e.g. Avanza 1.5 G'
                required
              />
              <FormInput<CarFormValues>
                control={form.control}
                name='licensePlate'
                label='License Plate'
                placeholder='e.g. B 1234 CD'
                required
              />
              <FormInput<CarFormValues>
                control={form.control}
                name='year'
                label='Year'
                placeholder='e.g. 2023'
                required
                type='number'
                min={1900}
              />
              <FormInput<CarFormValues>
                control={form.control}
                name='category'
                label='Category'
                placeholder='e.g. SUV, MPV, Sport'
                required
              />
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Technical Specs</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <FormSelect<CarFormValues>
                control={form.control}
                name='transmission'
                label='Transmission'
                placeholder='Select transmission'
                required
                options={TRANSMISSION_OPTIONS}
              />
              <FormSelect<CarFormValues>
                control={form.control}
                name='fuelType'
                label='Fuel Type'
                placeholder='Select fuel type'
                required
                options={FUEL_TYPE_OPTIONS}
              />
              <FormInput<CarFormValues>
                control={form.control}
                name='seatingCapacity'
                label='Seating Capacity'
                placeholder='e.g. 7'
                required
                type='number'
                min={1}
              />
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Rental Information</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='pricePerDay'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Price per Day
                      <span className='ml-1 text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        inputMode='numeric'
                        placeholder='Enter daily rental price'
                        value={
                          typeof field.value === 'number' && !Number.isNaN(field.value)
                            ? new Intl.NumberFormat('id-ID').format(field.value)
                            : ''
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, '');
                          const numeric = raw ? Number(raw) : 0;
                          field.onChange(numeric);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormSelect<CarFormValues>
                control={form.control}
                name='province'
                label='Province / Region'
                placeholder='Select province or region'
                required
                options={provinceOptions}
              />
              <FormSelect<CarFormValues>
                control={form.control}
                name='regency'
                label='Regency (Kabupaten/Kota)'
                placeholder='Select regency'
                required
                options={regencyOptions}
                onValueChange={(value) =>
                  form.setValue('regency', value, { shouldValidate: true })
                }
              />
              {currentUser?.role !== 'partner' && (
              <FormSelect<CarFormValues>
                control={form.control}
                name='partnerId'
                label='Rental Partner (optional)'
                placeholder='Select rental partner'
                options={partnerOptions}
              />
              )}
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <FormSelect<CarFormValues>
                control={form.control}
                name='status'
                label='Status'
                placeholder='Select status'
                required
                options={STATUS_OPTIONS}
              />
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Pickup Location Map</p>
              <p className='text-xs text-muted-foreground'>
                The map will follow the selected province in Indonesia.
              </p>
              <div className='mt-2 h-64 overflow-hidden rounded-xl border'>
                <Map
                  center={mapCenter ?? INDONESIA_DEFAULT_CENTER}
                  zoom={mapCenter ? 6 : 4}
                  scrollWheelZoom
                  className='h-full w-full'
                >
                  <MapTileLayer />
                  <MapZoomControl />
                  <MapClickHandler onClick={handleMapClick} />
                  {markerPosition && (
                    <MapMarker position={markerPosition}>
                      <MapPopup>
                        {selectedRegency || selectedProvince
                          ? `${selectedRegency ? selectedRegency + ', ' : ''}${selectedProvince}, Indonesia`
                          : 'Selected location'}
                      </MapPopup>
                    </MapMarker>
                  )}
                </Map>
                {isGeocodingLocation && (
                  <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60 text-xs text-muted-foreground'>
                    Updating map...
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Description</h3>
            <FormTextarea<CarFormValues>
              control={form.control}
              name='description'
              label='Description'
              placeholder='Enter car description'
              required
              config={{
                maxLength: 500,
                showCharCount: true,
                rows: 4
              }}
            />
          </div>

          <Separator />

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Features</h3>
            <FormField
              control={form.control}
              name='features'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car Features</FormLabel>
                  <FormControl>
                    <div className='space-y-3'>
                      <div className='flex gap-2'>
                        <Input
                          placeholder='Add a feature (e.g. Sunroof, Bluetooth, GPS)'
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (featureInput.trim()) {
                                const current = field.value || [];
                                if (!current.includes(featureInput.trim())) {
                                  field.onChange([...current, featureInput.trim()]);
                                }
                                setFeatureInput('');
                              }
                            }
                          }}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          onClick={() => {
                            if (featureInput.trim()) {
                              const current = field.value || [];
                              if (!current.includes(featureInput.trim())) {
                                field.onChange([...current, featureInput.trim()]);
                              }
                              setFeatureInput('');
                            }
                          }}
                        >
                          <Icons.add className='h-4 w-4' />
                        </Button>
                      </div>
                      <div className='flex flex-wrap gap-2 rounded-md border border-dashed p-3 min-h-[3rem]'>
                        {field.value?.map((feature: string) => (
                          <Badge key={feature} variant='secondary' className='px-3 py-1 text-sm'>
                            {feature}
                            <button
                              type='button'
                              className='ml-2 text-muted-foreground hover:text-destructive'
                              onClick={() => {
                                field.onChange(
                                  field.value?.filter((f) => f !== feature)
                                );
                              }}
                            >
                              <Icons.close className='h-3 w-3' />
                            </button>
                          </Badge>
                        ))}
                        {(!field.value || field.value.length === 0) && (
                          <p className='text-sm text-muted-foreground self-center italic'>
                            No features added yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <div className='text-[0.8rem] text-muted-foreground'>
                    Type a feature name and press Enter or click the plus button to add it.
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type='submit'>Save Car</Button>
        </Form>
      </CardContent>
    </Card>
  );
}
