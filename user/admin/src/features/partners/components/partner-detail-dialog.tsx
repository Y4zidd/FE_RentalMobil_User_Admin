'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AdminRentalPartner } from '@/lib/api-admin-partners';

interface PartnerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: AdminRentalPartner | null;
}

export function PartnerDetailDialog({
  open,
  onOpenChange,
  partner
}: PartnerDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>
            Partner Details
          </DialogTitle>
        </DialogHeader>
        {partner && (
          <div className='space-y-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Name</p>
              <p className='font-medium'>{partner.name}</p>
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <p className='text-sm text-muted-foreground'>Province</p>
                <p className='font-medium'>
                  {partner.province || '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Regency</p>
                <p className='font-medium'>
                  {partner.regency || '-'}
                </p>
              </div>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Address</p>
              <p className='font-medium whitespace-pre-line'>
                {partner.address || '-'}
              </p>
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Contact Name
                </p>
                <p className='font-medium'>
                  {partner.contact_name || '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Contact Phone
                </p>
                <p className='font-medium'>
                  {partner.contact_phone || '-'}
                </p>
              </div>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>
                Contact Email
              </p>
              <p className='font-medium'>
                {partner.contact_email || '-'}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Status</p>
              <p className='font-medium'>
                {partner.status === 'active'
                  ? 'Active'
                  : 'Inactive'}
              </p>
            </div>
            <div className='pt-2'>
              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

