import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev_only';
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: { [key: string]: unknown }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Session valid for 1 day
    .sign(encodedKey);
}

export async function verifySession(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}
