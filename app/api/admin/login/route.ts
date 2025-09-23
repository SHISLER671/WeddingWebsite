import { NextRequest, NextResponse } from 'next/server';
import { createSignedToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const { userType, password } = await request.json();

    if (!userType || !password) {
      return NextResponse.json(
        { message: 'User type and password are required' },
        { status: 400 }
      );
    }

    console.log('Admin login attempt for userType:', userType);

    const adminCredentials = {
      'BRIDE': { id: 1, user_type: 'BRIDE', password: '97d9beccf2ef6fcbc8eb3a5fcb1300d4:3150548e20bf66bf49ad57fc96055ca5cadd4100071959713e2300aca287e6af69d15bda639731acd0f87707ea594407f30dc638dd987124eae9515834675b3b' },
      'GROOM': { id: 2, user_type: 'GROOM', password: '79eb55c8d37ed20ed01c308d39aa5bf6:d23abefb2147ddb79830114470c48567248985ad35c73c8e165c42ce7e4841e3d17b48b283ad8632e2c04539bf876be03242e99c0f954e839a5aa5fa351d5d76' },
      'PLANNER': { id: 3, user_type: 'PLANNER', password: '0e41f602bacbfa5870c096e8348335c5:bfd6441c01dd676514c5a8b4df2004b03d2ac6e19bd426345b0640c29a6a0c091b714dd8c240ce7bc692e76e757f95eb0d025d018aba188982355e6bfff15a9' }
    };

    const adminUsers = adminCredentials[userType as keyof typeof adminCredentials];
    if (!adminUsers) {
      console.warn('No admin user found for userType:', userType);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, adminUsers.password);
console.log('Password verification result:', isValidPassword); // Ensure this is here

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const tokenData = {
      userType: adminUsers.user_type,
      id: adminUsers.id,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };
    const token = createSignedToken(tokenData);

    const response = NextResponse.json({
      success: true,
      userType: adminUsers.user_type,
      message: 'Login successful'
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}