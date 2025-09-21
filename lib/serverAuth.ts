import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { redirect } from 'next/navigation';

export async function getAdminUser() {
  const cookieStore = await cookies(); // Await the promise
  const token = cookieStore.get('admin-token')?.value;
  
  if (!token) {
    return null;
  }
  
  const tokenData = verifyToken(token);
  
  if (!tokenData) {
    return null;
  }
  
  return tokenData;
}

export async function requireAdminAuth() {
  const user = await getAdminUser();
  
  if (!user) {
    redirect('/');
  }
  
  return user;
}
