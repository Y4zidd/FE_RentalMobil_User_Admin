'use client';

import { FormFileUpload } from '@/components/forms/form-file-upload';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormCheckboxGroup } from '@/components/forms/form-checkbox-group';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
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
  CATEGORY_OPTIONS,
  FEATURES_OPTIONS,
  FUEL_TYPE_OPTIONS,
  STATUS_OPTIONS,
  TRANSMISSION_OPTIONS
} from './product-tables/options';
import { Map, MapMarker, MapPopup, MapTileLayer, MapZoomControl } from '@/components/ui/map';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const INDONESIA_DEFAULT_CENTER: [number, number] = [-2, 115];

const INDONESIAN_PROVINCES: FormOption[] = [
  { value: 'Aceh', label: 'Aceh' },
  { value: 'Sumatera Utara', label: 'Sumatera Utara' },
  { value: 'Sumatera Barat', label: 'Sumatera Barat' },
  { value: 'Riau', label: 'Riau' },
  { value: 'Kepulauan Riau', label: 'Kepulauan Riau' },
  { value: 'Jambi', label: 'Jambi' },
  { value: 'Sumatera Selatan', label: 'Sumatera Selatan' },
  { value: 'Kepulauan Bangka Belitung', label: 'Kepulauan Bangka Belitung' },
  { value: 'Bengkulu', label: 'Bengkulu' },
  { value: 'Lampung', label: 'Lampung' },
  { value: 'DKI Jakarta', label: 'DKI Jakarta' },
  { value: 'Jawa Barat', label: 'Jawa Barat' },
  { value: 'Banten', label: 'Banten' },
  { value: 'Jawa Tengah', label: 'Jawa Tengah' },
  { value: 'DI Yogyakarta', label: 'DI Yogyakarta' },
  { value: 'Jawa Timur', label: 'Jawa Timur' },
  { value: 'Bali', label: 'Bali' },
  { value: 'Nusa Tenggara Barat', label: 'Nusa Tenggara Barat' },
  { value: 'Nusa Tenggara Timur', label: 'Nusa Tenggara Timur' },
  { value: 'Kalimantan Barat', label: 'Kalimantan Barat' },
  { value: 'Kalimantan Tengah', label: 'Kalimantan Tengah' },
  { value: 'Kalimantan Selatan', label: 'Kalimantan Selatan' },
  { value: 'Kalimantan Timur', label: 'Kalimantan Timur' },
  { value: 'Kalimantan Utara', label: 'Kalimantan Utara' },
  { value: 'Sulawesi Utara', label: 'Sulawesi Utara' },
  { value: 'Sulawesi Tengah', label: 'Sulawesi Tengah' },
  { value: 'Sulawesi Selatan', label: 'Sulawesi Selatan' },
  { value: 'Sulawesi Tenggara', label: 'Sulawesi Tenggara' },
  { value: 'Gorontalo', label: 'Gorontalo' },
  { value: 'Sulawesi Barat', label: 'Sulawesi Barat' },
  { value: 'Maluku', label: 'Maluku' },
  { value: 'Maluku Utara', label: 'Maluku Utara' },
  { value: 'Papua', label: 'Papua' },
  { value: 'Papua Barat', label: 'Papua Barat' },
  { value: 'Papua Barat Daya', label: 'Papua Barat Daya' },
  { value: 'Papua Tengah', label: 'Papua Tengah' },
  { value: 'Papua Pegunungan', label: 'Papua Pegunungan' },
  { value: 'Papua Selatan', label: 'Papua Selatan' }
];

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
  seatingCapacity: z.coerce.number().min(1, {
    message: 'Capacity must be at least 1.'
  }),
  year: z.coerce.number().min(1900, {
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
  status: z.string().default('available'),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.'
  }),
  features: z.array(z.string()).default([])
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
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const geocodeControllerRef = useRef<AbortController | null>(null);
  const [existingImages, setExistingImages] = useState(initialData?.images ?? []);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  const parsedLocation = (() => {
    const location = initialData?.location || '';
    if (!location.includes(',')) {
      return {
        province: location
      };
    }
    const [province] = location.split(',').map((part) => part.trim());
    return {
      province
    };
  })();

  const defaultValues = {
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    licensePlate: initialData?.license_plate || '',
    pricePerDay: initialData?.price_per_day || 0,
    seatingCapacity: initialData?.seating_capacity || 1,
    transmission: initialData?.transmission || '',
    fuelType: initialData?.fuel_type || '',
    province: parsedLocation.province,
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

  const handleRemoveExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((image) => image.id !== id));
    setDeletedImageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  useEffect(() => {
    const query = selectedProvince ? `${selectedProvince}, Indonesia` : '';

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
  }, [selectedProvince]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const formData = new FormData();

      const hasExistingImages = existingImages.length > 0;
      const hasNewImages = Array.isArray(values.image) && values.image.length > 0;

      if (!hasExistingImages && !hasNewImages) {
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
        location_name: `${values.province}, Indonesia`,
        location_city: values.province,
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
        formData.append('_method', 'PUT');
        await apiClient.post(`/api/admin/cars/${initialData.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Car updated successfully');
      } else {
        await apiClient.post('/api/admin/cars', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
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
          Object.values(fieldErrors)?.[0]?.[0] || 'Validation error';
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
          <FormFileUpload<CarFormValues>
            control={form.control}
            name='image'
            label='Car Image'
            description='Upload at least one car image'
            config={{
              maxSize: 5 * 1024 * 1024,
              maxFiles: 8
            }}
          />

          {initialData && existingImages.length > 0 && (
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Existing Images</p>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                {existingImages.map((image) => (
                  <div
                    key={image.id}
                    className='relative overflow-hidden rounded-xl bg-muted'
                  >
                    <img
                      src={image.image_url}
                      alt={initialData.name}
                      className='h-40 w-full object-cover'
                    />
                    <Button
                      type='button'
                      size='icon'
                      variant='destructive'
                      className='absolute right-3 top-3 h-8 w-8 rounded-full bg-red-500/90 text-white shadow-md'
                      onClick={() => handleRemoveExistingImage(image.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              <FormSelect<CarFormValues>
                control={form.control}
                name='category'
                label='Category'
                placeholder='Select category'
                required
                options={CATEGORY_OPTIONS}
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
                options={INDONESIAN_PROVINCES}
              />
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
                  {markerPosition && (
                    <MapMarker position={markerPosition}>
                      <MapPopup>
                        {selectedProvince
                          ? `${selectedProvince}, Indonesia`
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
            <FormCheckboxGroup<CarFormValues>
              control={form.control}
              name='features'
              label='Car Features'
              description='Select the available features for this car'
              options={FEATURES_OPTIONS}
              columns={2}
            />
          </div>

          <Button type='submit'>Save Car</Button>
        </Form>
      </CardContent>
    </Card>
  );
}
