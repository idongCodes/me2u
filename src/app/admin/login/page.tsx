'use client';

import { useActionState, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendMfaCode, verifyMfaCode } from '@/app/actions/admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+17743126471');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  
  const [sendState, sendAction, isSending] = useActionState(sendMfaCode, null);
  const [verifyState, verifyAction, isVerifying] = useActionState(verifyMfaCode, null);

  useEffect(() => {
    if (verifyState?.success && verifyState?.verified) {
      router.push('/admin');
    }
  }, [verifyState, router]);

  const showStep2 = sendState?.success && !isEditingPhone;

  const handlePhoneSubmit = (formData: FormData) => {
    setIsEditingPhone(false);
    sendAction(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {!showStep2 ? 'Enter your phone number to receive a secure code.' : 'Enter the code sent to your phone.'}
          </p>
        </div>

        {!showStep2 ? (
          <form action={handlePhoneSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="phone" className="sr-only">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                  placeholder="Phone Number (+1...)"
                />
              </div>
            </div>

            {sendState?.error && !isEditingPhone && (
              <div className="text-red-500 text-sm text-center font-medium">
                {sendState.error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSending}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
              >
                {isSending ? 'Sending...' : 'Send Code'}
              </button>
            </div>
          </form>
        ) : (
          <form action={verifyAction} className="mt-8 space-y-6">
            <input type="hidden" name="phone" value={phone} />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="code" className="sr-only">MFA Code</label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  pattern="[0-9]*"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700 text-center tracking-widest text-lg"
                  placeholder="------"
                />
              </div>
            </div>

            {verifyState?.error && (
              <div className="text-red-500 text-sm text-center font-medium">
                {verifyState.error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isVerifying}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
              >
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingPhone(true)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Back to phone number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
