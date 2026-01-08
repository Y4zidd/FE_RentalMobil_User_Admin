'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormTextarea } from '@/components/forms/form-textarea';
import { FormSelect } from '@/components/forms/form-select';
import { Input } from '@/components/ui/input';
import type { UseFormReturn } from 'react-hook-form';
import type { FormOption } from '@/types/base-form';
import type { AdminRentalPartner } from '@/lib/api-admin-partners';
import { IconPlus } from '@tabler/icons-react';

export type PartnerFormValues = {
  name: string;
  province?: string;
  regency?: string;
  address?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  status: 'active' | 'inactive';
};

interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCreate: () => void;
  form: UseFormReturn<PartnerFormValues>;
  editing: AdminRentalPartner | null;
  provinceOptions: FormOption[];
  regencyOptions: FormOption[];
  onSubmit: (values: PartnerFormValues) => Promise<void>;
  onCancel: () => void;
}

export function PartnerFormDialog({
  open,
  onOpenChange,
  onOpenCreate,
  form,
  editing,
  provinceOptions,
  regencyOptions,
  onSubmit,
  onCancel
}: PartnerFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={onOpenCreate} className='text-xs md:text-sm'>
          <IconPlus className='mr-2 h-4 w-4' /> Add Partner
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Edit Partner' : 'Add Partner'}
          </DialogTitle>
        </DialogHeader>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={form.control}
              name='name'
              label='Partner Name'
              required
            />
            <FormSelect
              control={form.control}
              name='status'
              label='Status'
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
              ]}
              required
            />
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormSelect
              control={form.control}
              name='province'
              label='Province'
              placeholder='Select province'
              options={provinceOptions}
            />
            <FormSelect
              control={form.control}
              name='regency'
              label='Regency (Kabupaten/Kota)'
              placeholder='Select regency'
              options={regencyOptions}
            />
          </div>
          <FormTextarea
            control={form.control}
            name='address'
            label='Address'
            placeholder='Full address (optional)'
            config={{
              rows: 3
            }}
          />
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={form.control}
              name='contact_name'
              label='Contact Name'
            />
            <FormInput
              control={form.control}
              name='contact_phone'
              label='Contact Phone'
            />
            <FormField
              control={form.control}
              name='contact_email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='example@mail.com'
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex gap-2 pt-2'>
            <Button type='submit' className='flex-1'>
              {editing ? 'Save Changes' : 'Save'}
            </Button>
            <Button
              type='button'
              variant='outline'
              className='flex-1'
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

