import { redirect } from 'next/navigation';

export default async function Page() {
  // No auth: always send users to the main dashboard overview
  redirect('/dashboard/overview');
}
