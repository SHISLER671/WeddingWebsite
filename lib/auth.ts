import { createHmac, timingSafeEqual } from 'crypto';

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required for secure authentication');
  }
  return secret;
}

export function createSignedToken(payload: { userType: string; id: number; exp: number }): string {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', getJWTSecret()).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${signature}`;
}

export function verifyToken(token: string): { userType: string; id: number; exp: number } | null {
  try {
    const [payload, signature] = token.split('.');
    
    if (!payload || !signature) {
      return null;
    }

    // Verify signature
    const expectedSignature = createHmac('sha256', getJWTSecret()).update(payload).digest('base64url');
    const providedSignature = Buffer.from(signature, 'base64url');
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'base64url');
    
    if (!timingSafeEqual(providedSignature, expectedSignatureBuffer)) {
      return null;
    }

    // Decode and verify payload
    const tokenData = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    // Check expiration
    if (tokenData.exp && tokenData.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return tokenData;
  } catch (error) {
    return null;
  }
}
