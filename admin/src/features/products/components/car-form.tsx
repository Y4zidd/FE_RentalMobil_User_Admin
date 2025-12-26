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

const ASEAN_COUNTRY_SET = new Set<string>([
  'Brunei',
  'Cambodia',
  'Indonesia',
  'Laos',
  'Malaysia',
  'Myanmar',
  'Philippines',
  'Singapore',
  'Thailand',
  'Vietnam'
]);

const ASEAN_DEFAULT_CENTER: [number, number] = [-2, 115];

const formSchema = z.object({
  image: z
    .array(z.any())
    .nonempty('Image is required.')
    .refine(
      (files) =>
        files.every(
          (file) => file && typeof file.size === 'number' && file.size <= MAX_FILE_SIZE
        ),
      `Max file size is 5MB per image.`
    )
    .refine(
      (files) =>
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
  country: z.string().min(1, {
    message: 'Country is required.'
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
  const [countryOptions, setCountryOptions] = useState<FormOption[]>([]);
  const [provinceOptionsByCountry, setProvinceOptionsByCountry] = useState<
    Record<string, FormOption[]>
  >({});
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const geocodeControllerRef = useRef<AbortController | null>(null);

  const parsedLocation = (() => {
    const location = initialData?.location || '';
    if (!location.includes(',')) {
      return {
        province: location,
        country: ''
      };
    }
    const [province, country] = location.split(',').map((part) => part.trim());
    return {
      province,
      country
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
    country: parsedLocation.country,
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

  const selectedCountry = form.watch('country');
  const selectedProvince = form.watch('province');

  useEffect(() => {
    let isMounted = true;

    const fetchCountries = async () => {
      try {
        setIsLoadingLocations(true);

        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name'
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        const countrySet = new Set<string>();

        data.forEach((item: any) => {
          const name = item.name?.common as string | undefined;
          if (!name) {
            return;
          }
          if (!ASEAN_COUNTRY_SET.has(name)) {
            return;
          }
          countrySet.add(name);
        });

        const countries: FormOption[] = Array.from(countrySet)
          .map((name) => ({
            value: name,
            label: name
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setCountryOptions(countries);
      } catch {
      } finally {
        if (isMounted) {
          setIsLoadingLocations(false);
        }
      }
    };

    fetchCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      return;
    }

    if (provinceOptionsByCountry[selectedCountry]) {
      return;
    }

    let isMounted = true;

    const fetchStates = async () => {
      try {
        setIsLoadingLocations(true);

        const response = await fetch(
          'https://countriesnow.space/api/v0.1/countries/states',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              country: selectedCountry
            })
          }
        );

        if (!response.ok) {
          return;
        }

        const json = await response.json();

        if (!isMounted) {
          return;
        }

        const states = json?.data?.states ?? [];

        const options: FormOption[] = states
          .map((state: any) => ({
            value: state.name,
            label: state.name
          }))
          .sort((a: FormOption, b: FormOption) =>
            a.label.localeCompare(b.label)
          );

        setProvinceOptionsByCountry((prev) => ({
          ...prev,
          [selectedCountry]: options
        }));
      } catch {
      } finally {
        if (isMounted) {
          setIsLoadingLocations(false);
        }
      }
    };

    fetchStates();

    return () => {
      isMounted = false;
    };
  }, [selectedCountry, provinceOptionsByCountry]);

  useEffect(() => {
    const query =
      selectedProvince && selectedCountry
        ? `${selectedProvince}, ${selectedCountry}`
        : selectedCountry || selectedProvince;

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
            encodeURIComponent('90,30,150,-12') +
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
  }, [selectedCountry, selectedProvince]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const formData = new FormData();

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
        location_id: 1,
        description: values.description
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (values.image && values.image.length > 0) {
        values.image.forEach((file) => {
          formData.append('images[]', file);
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
      toast.error(error.response?.data?.message || 'Something went wrong');
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
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
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
                name='country'
                label='Country'
                placeholder={
                  isLoadingLocations ? 'Loading countries...' : 'Select country'
                }
                required
                disabled={isLoadingLocations}
                options={countryOptions}
              />
              <FormSelect<CarFormValues>
                control={form.control}
                name='province'
                label='Province / Region'
                placeholder='Select province or region'
                required
                disabled={
                  isLoadingLocations || !form.watch('country')
                }
                options={
                  provinceOptionsByCountry[form.watch('country')] ?? []
                }
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
                The map will follow the selected country and province/region.
              </p>
              <div className='mt-2 h-64 overflow-hidden rounded-xl border'>
                <Map
                  center={mapCenter ?? ASEAN_DEFAULT_CENTER}
                  zoom={mapCenter ? 6 : 4}
                  scrollWheelZoom
                  className='h-full w-full'
                >
                  <MapTileLayer />
                  <MapZoomControl />
                  {markerPosition && (
                    <MapMarker position={markerPosition}>
                      <MapPopup>
                        {selectedProvince && selectedCountry
                          ? `${selectedProvince}, ${selectedCountry}`
                          : selectedCountry || 'Selected location'}
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
