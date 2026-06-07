import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardContent from './components/DashboardContent';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  const session = await verifySession(sessionCookie);

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter">Admin <span className="text-skyblue">Panel</span></h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Manage your shop, reservations, and customer inquiries.
          </p>
        </header>
        
        <DashboardContent />
      </div>
    </div>
  );
}
