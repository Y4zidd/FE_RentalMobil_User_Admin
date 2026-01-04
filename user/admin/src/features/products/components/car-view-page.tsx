'use client';

import { fakeProducts, Product } from '@/constants/mock-api';
import { notFound } from 'next/navigation';
import CarForm from './car-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CarImageGallery } from './car-image-gallery';
import { useEffect, useState } from 'react';

type TCarViewPageProps = {
  productId: string;
};

export default function CarViewPage({
  productId
}: TCarViewPageProps) {
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId === 'new') {
        setLoading(false);
        return;
    }

    const fetchData = async () => {
        try {
            const data = await fakeProducts.getProductById(Number(productId));
            if (data.success) {
                setProduct(data.product as Product);
            }
        } catch (error) {
            console.error(error);
        } finally {
        setLoading(false);
      }
  }
  fetchData();
  }, [productId]);

  if (productId === 'new') {
    return <CarForm initialData={null} pageTitle='Create New Car' />;
  }
  
  if (loading) {
      return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const statusLower = product.status.toLowerCase();

  let statusColor = '';

  if (statusLower === 'available') {
    statusColor =
      'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent';
  } else if (statusLower === 'rented') {
    statusColor =
      'bg-blue-500 hover:bg-blue-600 text-white border-transparent';
  } else if (statusLower === 'maintenance') {
    statusColor =
      'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent';
  } else {
    statusColor =
      'bg-gray-500 hover:bg-gray-600 text-white border-transparent';
  }

  const pricePerDay = product.price_per_day.toLocaleString('id-ID');

  const galleryImages =
    product.images && Array.isArray(product.images)
      ? product.images.map((image) => image.image_url)
      : [product.photo_url];

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Image</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <CarImageGallery
              mainImage={product.photo_url}
              images={galleryImages}
              alt={product.name}
            />
            <div className='space-y-2 text-sm'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Status</span>
                <Badge
                  className={cn(
                    'rounded-full px-3 text-xs capitalize',
                    statusColor
                  )}
                >
                  {product.status}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Price per day</span>
                <span className='font-medium'>Rp {pricePerDay}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Specifications</CardTitle>
            <CardDescription>
              {product.brand} • {product.model} • {product.year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
              <dt className='text-muted-foreground'>Brand</dt>
              <dd className='font-medium'>{product.brand}</dd>
              <dt className='text-muted-foreground'>Model</dt>
              <dd className='font-medium'>{product.model}</dd>
              <dt className='text-muted-foreground'>Category</dt>
              <dd className='font-medium'>{product.category}</dd>
              <dt className='text-muted-foreground'>Year</dt>
              <dd className='font-medium'>{product.year}</dd>
              <dt className='text-muted-foreground'>Transmission</dt>
              <dd className='font-medium capitalize'>
                {product.transmission}
              </dd>
              <dt className='text-muted-foreground'>Fuel type</dt>
              <dd className='font-medium'>{product.fuel_type}</dd>
              <dt className='text-muted-foreground'>Seating capacity</dt>
              <dd className='font-medium'>
                {product.seating_capacity} passengers
              </dd>
              <dt className='text-muted-foreground'>Location</dt>
              <dd className='font-medium'>
                {product.location?.replace(/,\s*Indonesia\s*$/i, '')}
              </dd>
              <dt className='text-muted-foreground'>Rental price</dt>
              <dd className='font-medium'>Rp {pricePerDay} / day</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Description</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm leading-relaxed'>{product.description}</p>
          {product.features && product.features.length > 0 && (
            <div className='space-y-2'>
              <h3 className='text-sm font-medium text-muted-foreground'>
                Features
              </h3>
              <div className='flex flex-wrap gap-2'>
                {product.features.map((feature) => (
                  <Badge
                    key={feature}
                    variant='outline'
                    className='rounded-full px-3 text-xs'
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
