'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { FormInput } from '@/components/forms/form-input';
import apiClient from '@/lib/api-client';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const defaultValues = {
    email: 'admin@demo.com',
    password: 'password'
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        const response = await apiClient.post('/api/admin/login', data);
        if (response.data.token) {
          localStorage.setItem('admin_token', response.data.token);
          localStorage.setItem('admin_user', JSON.stringify(response.data.user));
          toast.success('Signed In Successfully!');
          router.push('/dashboard');
        } else {
          toast.error('Login failed: No token received');
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Login failed');
      }
    });
  };

  return (
    <>
      <Form
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full space-y-2'
      >
        <FormInput
          control={form.control}
          name='email'
          label='Email'
          placeholder='Enter your email...'
          disabled={loading}
        />
        <FormInput
          control={form.control}
          name='password'
          label='Password'
          type='password'
          placeholder='Enter your password...'
          disabled={loading}
        />
        <Button
          disabled={loading}
          className='mt-2 ml-auto w-full'
          type='submit'
        >
          Login
        </Button>
      </Form>
    </>
  );
}
