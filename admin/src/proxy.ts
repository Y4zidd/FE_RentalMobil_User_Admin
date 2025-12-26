// No-op proxy so the app can run without Clerk.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This function runs for every request matched by `config.matcher`.
export default function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: []
};
