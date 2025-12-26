import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // No auth: always send users to the main dashboard overview
  redirect('/dashboard/overview');
}
