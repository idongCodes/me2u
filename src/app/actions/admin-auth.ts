'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import AdminCode from '@/models/AdminCode';
import { createSession } from '@/lib/auth';
import twilio from 'twilio';

const ALLOWED_PHONE = '+17743126471';

export async function sendMfaCode(prevState: unknown, formData: FormData) {
  const phone = formData.get('phone') as string;

  if (!phone) {
    return { error: 'Phone number is required', success: false };
  }

  if (phone !== ALLOWED_PHONE) {
    return { error: 'Access denied. Unauthorized phone number.', success: false };
  }

  try {
    await connectToDatabase();

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await AdminCode.findOneAndUpdate(
      { phone },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    console.log(`[DEV MODE] MFA Code for ${phone} is: ${code}`);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhone) {
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: `Your me2u admin verification code is: ${code}`,
        from: twilioPhone,
        to: phone,
      });
      console.log('SMS sent successfully');
    } else {
      console.warn('Twilio credentials not found. Check the console for the MFA code.');
    }

    return { success: true, phone };
  } catch (error: any) {
    console.error('sendMfaCode error:', error);
    return { error: error.message || 'An internal server error occurred.', success: false };
  }
}

export async function verifyMfaCode(prevState: unknown, formData: FormData) {
  const phone = formData.get('phone') as string;
  const code = formData.get('code') as string;

  if (!phone || !code) {
    return { error: 'Phone and code are required', success: false };
  }

  try {
    await connectToDatabase();

    const record = await AdminCode.findOne({ phone, code });

    if (!record) {
      return { error: 'Invalid code.', success: false };
    }

    if (record.expiresAt < new Date()) {
      return { error: 'Code has expired. Please request a new one.', success: false };
    }

    await AdminCode.deleteOne({ _id: record._id });

    const session = await createSession({ phone, role: 'admin' });
    const cookieStore = await cookies();
    cookieStore.set('admin_session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.fromme2u.app' : undefined,
    });

    return { success: true, verified: true };
  } catch (error: any) {
    console.error('verifyMfaCode error:', error);
    return { error: error.message || 'An internal server error occurred.', success: false };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: 'admin_session',
    domain: process.env.NODE_ENV === 'production' ? '.fromme2u.app' : undefined,
    path: '/',
  });
  revalidatePath('/', 'layout');
}
