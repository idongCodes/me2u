import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Welcome to the protected admin area. Access granted via MFA.
        </p>
        
        {/* Empty admin page as requested */}
        <div className="border-4 border-dashed border-gray-200 dark:border-gray-800 rounded-xl h-64 flex items-center justify-center">
          <p className="text-gray-500">Admin content goes here</p>
        </div>
      </div>
    </div>
  );
}
