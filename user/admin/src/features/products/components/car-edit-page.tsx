'use client';

import { useEffect, useState } from 'react';
import CarForm from './car-form';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { fakeProducts, Product } from '@/constants/mock-api';

type CarEditPageProps = {
  productId: string;
};

export function CarEditPage({ productId }: CarEditPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCar = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fakeProducts.getProductById(Number(productId));
        if (!isMounted) return;

        if (!result.success || !result.product) {
          setProduct(null);
          return;
        }

        setProduct(result.product as Product);
      } catch (err: any) {
        if (!isMounted) return;
        setError('Failed to load car');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCar();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return <FormCardSkeleton />;
  }

  if (error) {
    return (
      <div className='p-6 text-sm text-destructive'>
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className='p-6 text-sm text-muted-foreground'>
        Car not found.
      </div>
    );
  }

  return <CarForm initialData={product} pageTitle='Edit Car' />;
}
