'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BadgeCheck } from 'lucide-react';

export default function ExclusivePage() {
  return (
    <PageContainer isloading={false}>
      <div className='space-y-6'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <BadgeCheck className='h-7 w-7 text-green-600' />
            Exclusive Area (Template)
          </h1>
          <p className='text-muted-foreground'>
            Example page that used to be protected by plan-based access. Now it
            is always visible as a simple template.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Customize This Page</CardTitle>
            <CardDescription>
              Use this section for any admin-only or premium features powered
              by your Laravel backend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-lg'>Have a wonderful day!</div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
