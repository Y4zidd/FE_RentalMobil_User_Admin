'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatisticsCard from '@/components/shadcn-studio/blocks/statistics-card-01';
import {
  CalendarClockIcon,
  ClockIcon,
  CarFrontIcon,
  CheckCircle2Icon,
  Check,
  CheckCircle2,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { Column, ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { fetchAdminOverview } from '@/lib/api-admin-overview';
import {
  BookingRow,
  fetchAdminBookings,
  updateAdminBookingStatus,
  cleanupOverdueBookings
} from '@/lib/api-admin-bookings';

const bookingStatisticsCardData = [
  {
    icon: <CarFrontIcon className='size-4' />,
    value: '0',
    title: 'Total Bookings',
    changePercentage: '+0% vs last month'
  },
  {
    icon: <ClockIcon className='size-4' />,
    value: '0',
    title: 'Pending',
    changePercentage: '+0% vs last week'
  },
  {
    icon: <CheckCircle2Icon className='size-4' />,
    value: '0',
    title: 'Confirmed',
    changePercentage: '+0% vs last week'
  },
  {
    icon: <CalendarClockIcon className='size-4' />,
    value: '0',
    title: 'Cancelled',
    changePercentage: '+0% vs last week'
  },
  {
    icon: <CalendarClockIcon className='size-4' />,
    value: '0',
    title: 'Completed',
    changePercentage: '+0% vs last week'
  }
];

const BOOKING_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed' }
];

export default function BookingsPage() {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [stats, setStats] = useState(bookingStatisticsCardData);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const applyOverviewMetricsToStats = (metrics: any) => {
    setStats((prev) =>
      prev.map((card) => {
        if (card.title === 'Total Bookings') {
          return {
            ...card,
            value: String(metrics.total_bookings ?? 0)
          };
        }
        if (card.title === 'Pending') {
          return {
            ...card,
            value: String(metrics.pending_bookings ?? 0)
          };
        }
        if (card.title === 'Confirmed') {
          return {
            ...card,
            value: String(metrics.confirmed_bookings ?? 0)
          };
        }
        if (card.title === 'Cancelled') {
          return {
            ...card,
            value: String(metrics.cancelled_bookings ?? 0)
          };
        }
        if (card.title === 'Completed') {
          return {
            ...card,
            value: String(metrics.completed_bookings ?? 0)
          };
        }
        return card;
      })
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewResult, bookingsResult] = await Promise.allSettled([
          fetchAdminOverview(),
          fetchAdminBookings()
        ]);

        if (overviewResult.status === 'fulfilled') {
          const metrics = overviewResult.value.metrics || {};
          applyOverviewMetricsToStats(metrics);
        } else {
          console.error('Failed to fetch overview metrics', overviewResult.reason);
        }

        if (bookingsResult.status === 'fulfilled') {
          const bookingsRes = bookingsResult.value;
          setBookings(bookingsRes);
        } else {
          console.error('Failed to fetch bookings', bookingsResult.reason);
        }
      } catch (error) {
        console.error('Unexpected error fetching bookings data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const updated = await updateAdminBookingStatus(id, status);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: updated.status
              }
            : b
        )
      );
      toast.success(`Booking #${id} status updated to ${status}`);
      try {
        const overviewRes = await fetchAdminOverview();
        const metrics = overviewRes.metrics || {};
        applyOverviewMetricsToStats(metrics);
      } catch (err) {
        console.error('Failed to refresh overview metrics after status change', err);
      }
    } catch (error: any) {
      console.error('Failed to update booking status', error);
      const message =
        error?.response?.data?.message ||
        'Failed to update booking status';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const bookingColumns: ColumnDef<BookingRow>[] = useMemo(
    () => [
      {
        id: 'rowNumber',
        header: 'ID',
        cell: ({ row }) => row.index + 1
      },
      {
        id: 'search',
        accessorKey: 'customerName',
        header: ({ column }: { column: Column<BookingRow, unknown> }) => (
          <DataTableColumnHeader column={column} title='Customer' />
        ),
        cell: ({ row }) => {
          const name = row.original.customerName;
          const email = row.original.customerEmail;
          return (
            <div className='flex flex-col'>
              <span className='font-medium'>{name}</span>
              <span className='text-xs text-muted-foreground'>{email}</span>
            </div>
          );
        },
        meta: {
          label: 'Customer',
          placeholder: 'Search customer...',
          variant: 'text'
        },
        enableColumnFilter: true
      },
      {
        accessorKey: 'carName',
        header: 'Car',
        meta: {
          label: 'Car'
        }
      },
      {
        accessorKey: 'pickupDate',
        header: 'Pickup Date',
        cell: ({ cell }) => {
          const value = cell.getValue<string>();
          if (!value) return '-';
          const date = new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      },
      {
        accessorKey: 'returnDate',
        header: 'Return Date',
        cell: ({ cell }) => {
          const value = cell.getValue<string>();
          if (!value) return '-';
          const date = new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      },
      {
        accessorKey: 'totalPrice',
        header: 'Total Price',
        cell: ({ cell }) => {
          const amount = Number(cell.getValue<number>() || 0);
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
          }).format(amount);
        },
        meta: {
          label: 'Total Price'
        }
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
        cell: ({ cell }) => {
          const value = cell.getValue<string>();
          if (value === 'online_full') {
            return 'Online (Full Payment)';
          }
          if (value === 'pay_at_location') {
            return 'Pay at Location';
          }
          return value;
        },
        meta: {
          label: 'Payment Method'
        }
      },
      {
        accessorKey: 'status',
        header: ({ column }: { column: Column<BookingRow, unknown> }) => (
          <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue<string>()?.toLowerCase();

          let badgeColor = '';
          switch (status) {
            case 'pending':
              badgeColor =
                'bg-amber-500/15 text-amber-500 border border-amber-500/40';
              break;
            case 'confirmed':
              badgeColor =
                'bg-blue-500/15 text-blue-500 border border-blue-500/40';
              break;
            case 'cancelled':
              badgeColor =
                'bg-red-500/15 text-red-500 border border-red-500/40';
              break;
            case 'completed':
              badgeColor =
                'bg-emerald-500/15 text-emerald-500 border border-emerald-500/40';
              break;
            default:
              badgeColor =
                'bg-gray-500/15 text-gray-500 border border-gray-500/40';
          }

          const label =
            BOOKING_STATUS_OPTIONS.find(
              (opt) => opt.value === status
            )?.label || status;

          return (
            <Badge
              className={cn('rounded-full px-3 text-xs capitalize', badgeColor)}
            >
              {label}
            </Badge>
          );
        },
        enableColumnFilter: true,
        meta: {
          label: 'Status',
          variant: 'multiSelect',
          options: BOOKING_STATUS_OPTIONS
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const booking = row.original;
          const isUpdating = updatingId === booking.id;
          const status = booking.status.toLowerCase();

          const canConfirm = status === 'pending';
          const canComplete = status === 'confirmed';
          const canCancel = status === 'pending' || status === 'confirmed';

          return (
            <div className='flex items-center gap-2'>
              {canConfirm && (
                <Button
                  size='icon'
                  disabled={isUpdating}
                  aria-label='Confirm booking'
                  onClick={() => handleStatusChange(booking.id, 'confirmed')}
                >
                  <Check className='h-4 w-4' />
                </Button>
              )}
              {canComplete && (
                <Button
                  size='icon'
                  variant='outline'
                  disabled={isUpdating}
                  aria-label='Mark booking completed'
                  onClick={() => handleStatusChange(booking.id, 'completed')}
                >
                  <CheckCircle2 className='h-4 w-4' />
                </Button>
              )}
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size='icon'
                      variant='destructive'
                      disabled={isUpdating}
                      aria-label='Cancel booking'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Cancel this booking?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. The booking will be marked as
                        cancelled.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Close</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleStatusChange(booking.id, 'cancelled')
                        }
                      >
                        Yes, cancel booking
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          );
        }
      }
    ],
    [updatingId]
  );

  const totalItems = bookings.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  const { table } = useDataTable({
    data: bookings,
    columns: bookingColumns,
    pageCount,
    shallow: false,
    debounceMs: 500
  });

  return (
    <PageContainer
      scrollable
      pageTitle='Manage Bookings'
      pageDescription='Manage Rent-A-Car bookings connected to the Laravel backend.'
    >
      <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
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
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading bookings...</div>
          ) : (
            <DataTable table={table}>
              <DataTableToolbar table={table} />
            </DataTable>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
