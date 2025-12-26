'use client';

import { ReactNode, useEffect, useState } from 'react';

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL;

type AdminAuthGuardProps = {
  children: ReactNode;
};

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('admin_token');
    if (!token) {
      if (USER_APP_URL) {
        window.location.href = USER_APP_URL;
      }
      return;
    }
    setAllowed(true);
  }, []);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}

