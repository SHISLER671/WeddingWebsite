import { NextRequest, NextResponse } from 'next/server';
import { createSignedToken } from '@/lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'wedding2026';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === ADMIN_PASSWORD) {
      // Create a token that expires in 24 hours
      const exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
      const token = createSignedToken({
        userType: 'admin',
        id: 1,
        exp,
      });

      const response = NextResponse.json({ success: true });
      
      // Set the admin-token cookie
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}

