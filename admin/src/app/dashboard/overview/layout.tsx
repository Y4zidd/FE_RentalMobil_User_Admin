'use client';

import React, { useEffect, useState } from 'react';

import PageContainer from '@/components/layout/page-container';
import StatisticsCard from '@/components/shadcn-studio/blocks/statistics-card-01';
import {
  CalendarClockIcon,
  ClockIcon,
  CarFrontIcon,
  CheckCircle2Icon,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AreaGraph } from '@/features/overview/components/area-graph';
import apiClient from '@/lib/api-client';

const statisticsCardData = [
  {
    icon: <CarFrontIcon className='size-4' />,
    value: '0',
    title: 'Total Cars',
    changePercentage: '+0% vs last month'
  },
  {
    icon: <CalendarClockIcon className='size-4' />,
    value: '0',
    title: 'Active Bookings',
    changePercentage: '+0% vs last week'
  },
  {
    icon: <ClockIcon className='size-4' />,
    value: '0',
    title: 'Pending Bookings',
    changePercentage: '+0% vs yesterday'
  },
  {
    icon: <CheckCircle2Icon className='size-4' />,
    value: '0',
    title: 'Confirmed Bookings',
    changePercentage: '+0% vs yesterday'
  }
];

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats,
  line_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
  line_stats: React.ReactNode;
}) {
  const [previewCars, setPreviewCars] = useState<any[]>([]);
  const [previewUsers, setPreviewUsers] = useState<any[]>([]);
  const [stats, setStats] = useState(statisticsCardData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Cars
        const carsRes = await apiClient.get('/api/admin/cars');
        const carsData = Array.isArray(carsRes.data) ? carsRes.data : carsRes.data.data || [];
        setPreviewCars(carsData.slice(0, 5).map((c: any) => ({
            photo: c.photo_url || 'https://via.placeholder.com/150',
            name: c.name,
            plate: c.license_plate,
            price: Number(c.price_per_day).toLocaleString('id-ID'),
            status: c.status
        })));

        // Fetch Users
        const usersRes = await apiClient.get('/api/admin/users');
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data || [];
        setPreviewUsers(usersData.slice(0, 5).map((u: any) => ({
            avatar: u.avatar_url,
            name: u.name,
            email: u.email,
            role: u.role === 'admin' ? 'Admin' : 'Staff'
        })));

        // Update Stats (Simplified for now, ideally fetch /api/admin/overview)
        const newStats = [...statisticsCardData];
        newStats[0].value = carsData.length.toString();
        // newStats[1].value = ... bookings count
        setStats(newStats);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {stats.map((card) => (
            <StatisticsCard
              key={card.title}
              icon={card.icon}
              value={card.value}
              title={card.title}
              changePercentage={card.changePercentage}
            />
          ))}
        </div>

        <div className='grid grid-cols-1 gap-4 pt-4 lg:grid-cols-2'>
          <AreaGraph />
          {line_stats}
        </div>

        <div className='flex flex-col gap-4 pt-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div>
                <CardTitle className='text-base'>Cars Preview</CardTitle>
                <p className='text-xs text-muted-foreground'>
                  Preview of cars, manage full details in Manage Cars.
                </p>
              </div>
              <Link
                href='/dashboard/cars'
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'text-xs'
                )}
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className='pt-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[72px]'>Image</TableHead>
                    <TableHead>Nama Mobil</TableHead>
                    <TableHead className='hidden sm:table-cell'>Plat</TableHead>
                    <TableHead className='hidden sm:table-cell'>Harga / Hari</TableHead>
                    <TableHead className='text-right'>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewCars.map((car) => {
                    const statusLower = car.status.toLowerCase();

                    let badgeColor = '';
                    let Icon = CheckCircle2;

                    if (statusLower === 'available') {
                      badgeColor =
                        'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent';
                    } else if (statusLower === 'rented') {
                      badgeColor =
                        'bg-blue-500 hover:bg-blue-600 text-white border-transparent';
                      Icon = XCircle;
                    } else if (statusLower === 'maintenance') {
                      badgeColor =
                        'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent';
                      Icon = XCircle;
                    } else {
                      badgeColor =
                        'bg-gray-500 hover:bg-gray-600 text-white border-transparent';
                      Icon = XCircle;
                    }

                    return (
                      <TableRow key={car.plate}>
                        <TableCell>
                          <div className='relative h-10 w-16 overflow-hidden rounded-md bg-muted'>
                            <Image
                              src={car.photo}
                              alt={car.name}
                              fill
                              className='object-cover'
                            />
                          </div>
                        </TableCell>
                        <TableCell className='font-medium'>{car.name}</TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          {car.plate}
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          Rp {car.price}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Badge
                            className={cn(
                              'rounded-full px-3 text-xs capitalize',
                              badgeColor
                            )}
                          >
                            <Icon className='mr-1 h-3 w-3' />
                            {car.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div>
                <CardTitle className='text-base'>Users Preview</CardTitle>
                <p className='text-xs text-muted-foreground'>
                  Preview of users with access to this dashboard.
                </p>
              </div>
              <Link
                href='/dashboard/users'
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'text-xs'
                )}
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className='pt-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[72px]'>Image</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className='hidden sm:table-cell'>Email</TableHead>
                    <TableHead className='text-right'>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewUsers.map((user) => {
                    let roleColor = '';

                    switch (user.role) {
                      case 'Admin':
                        roleColor =
                          'bg-blue-500 hover:bg-blue-600 text-white border-transparent';
                        break;
                      case 'Staff':
                        roleColor =
                          'bg-amber-500 hover:bg-amber-600 text-white border-transparent';
                        break;
                      default:
                        roleColor =
                          'bg-gray-500 hover:bg-gray-600 text-white border-transparent';
                    }

                    return (
                      <TableRow key={user.email}>
                        <TableCell>
                          <Avatar className='h-9 w-9 rounded-full border'>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className='font-medium'>
                          {user.name}
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          {user.email}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Badge
                            className={cn(
                              'rounded-full px-3 text-xs',
                              roleColor
                            )}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
