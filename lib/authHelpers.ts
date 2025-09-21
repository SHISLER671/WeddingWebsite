import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function requireAdminAPIAuth(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { message: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  const tokenData = verifyToken(token);
  
  if (!tokenData) {
    const response = NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 }
    );
    response.cookies.delete('admin-token');
    return response;
  }
  
  return tokenData;
}
