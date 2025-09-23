import { NextRequest, NextResponse } from 'next/server';
import { createSignedToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { userType, password } = await request.json();

    if (!userType || !password) {
      return NextResponse.json(
        { message: 'User type and password are required' },
        { status: 400 }
      );
    }

    console.log('Admin login attempt for userType:', userType, 'Received password:', password);

    // Temporary plain text passwords for testing (remove after)
    const adminCredentials = {
      'BRIDE': { id: 1, user_type: 'BRIDE', password: 'bridepass' }, // Change to your test password
      'GROOM': { id: 2, user_type: 'GROOM', password: 'groompass' }, // Change to your test password
      'PLANNER': { id: 3, user_type: 'PLANNER', password: 'plannerpass' } // Change to your test password
    };

    const adminUsers = adminCredentials[userType as keyof typeof adminCredentials];
    if (!adminUsers) {
      console.warn('No admin user found for userType:', userType);
      return NextResponse.json(
        { message: 'Invalid user type' },
        { status: 401 }
      );
    }

    const isValidPassword = password === adminUsers.password; // Plain text check for testing
    console.log('Password verification result:', isValidPassword, 'Input:', password, 'Expected:', adminUsers.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: `Invalid credentials for ${userType}: Password mismatch` },
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
        { message: 'Internal server error', error: error.message },
        { status: 500 }
      );
    }
}