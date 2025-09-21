import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get admin token from cookies
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token with HMAC signature
    const tokenData = verifyToken(token);
    
    if (!tokenData) {
      const response = NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
      response.cookies.delete('admin-token');
      return response;
    }

    return NextResponse.json({
      success: true,
      userType: tokenData.userType,
      id: tokenData.id
    });

  } catch (error) {
    console.error('Admin me error:', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}
