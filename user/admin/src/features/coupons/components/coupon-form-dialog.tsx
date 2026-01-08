'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { FormCheckbox } from '@/components/forms/form-checkbox';
import { Input } from '@/components/ui/input';
import type { UseFormReturn } from 'react-hook-form';
import type { Coupon } from '@/lib/api-admin-coupons';

export type CouponFormValues = {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_total?: number;
  max_uses?: number;
  starts_at?: Date;
  expires_at?: Date;
  is_active: boolean;
};

interface CouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CouponFormValues>;
  editing: Coupon | null;
  onSubmit: (values: CouponFormValues) => Promise<void>;
  onCancel: () => void;
}

export function CouponFormDialog({
  open,
  onOpenChange,
  form,
  editing,
  onSubmit,
  onCancel
}: CouponFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Edit Coupon' : 'Add Coupon'}
          </DialogTitle>
        </DialogHeader>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='grid grid-cols-1 gap-4'
        >
          <FormInput
            control={form.control}
            name='code'
            label='Code'
            required
          />
          <FormSelect
            control={form.control}
            name='discount_type'
            label='Discount Type'
            options={[
              { label: 'Percent (%)', value: 'percent' },
              { label: 'Fixed (IDR)', value: 'fixed' }
            ]}
            required
          />
          <FormInput
            control={form.control}
            name='discount_value'
            type='number'
            label='Discount Value'
            step={1}
            required
          />
          <FormField
            control={form.control}
            name='min_order_total'
            render={({ field }) => {
              const displayValue =
                field.value === undefined || field.value === null
                  ? ''
                  : new Intl.NumberFormat('id-ID').format(
                      Number(field.value) || 0
                    );
              return (
                <FormItem>
                  <FormLabel>Min. Order (optional)</FormLabel>
                  <FormControl>
                    <Input
                      inputMode='numeric'
                      placeholder='0'
                      value={displayValue}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const numericString = raw
                          .replace(/\./g, '')
                          .replace(/,/g, '');
                        if (!numericString) {
                          field.onChange(undefined);
                          return;
                        }
                        const numeric = Number(numericString);
                        if (Number.isNaN(numeric)) {
                          field.onChange(undefined);
                        } else {
                          field.onChange(numeric);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormInput
            control={form.control}
            name='max_uses'
            type='number'
            label='Max Uses (optional)'
            step={1}
          />
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormDatePicker
              control={form.control}
              name='starts_at'
              label='Starts At'
              description='Start date'
            />
            <FormDatePicker
              control={form.control}
              name='expires_at'
              label='Expires At'
              description='Expiry date'
            />
          </div>
          <FormCheckbox
            control={form.control}
            name='is_active'
            checkboxLabel='Active'
          />
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

