'use server';

import { generatePersonalizedInvites, generatePreview } from '@/lib/invite-generator';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

function checkAdminAuth() {
  const cookieStore = cookies();
  const adminToken = cookieStore.get('admin-token')?.value;
  
  if (!adminToken) {
    redirect('/admin');
  }
  
  const tokenData = verifyToken(adminToken);
  if (!tokenData) {
    redirect('/admin');
  }
}

export async function generateInvites(formData: FormData) {
  checkAdminAuth();

  const csvFile = formData.get('csv') as File;
  const templateFile = formData.get('template') as File;
  if (!csvFile || !templateFile) throw new Error('Missing files');

  const options = {
    x: Number(formData.get('x') || 600),
    y: Number(formData.get('y') || 900),
    fontSize: Number(formData.get('fontSize') || 80),
    color: (formData.get('color') as string) || '#D4AF37',
    strokeColor: (formData.get('strokeColor') as string) || '#4a1c1c',
    strokeWidth: Number(formData.get('strokeWidth') || 4),
    font: (formData.get('font') as string) || 'PlayfairDisplay-Regular',
  };

  const zipBuffer = await generatePersonalizedInvites(csvFile, templateFile, options);

  return new Response(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=personalized-wedding-invitations.zip',
    },
  });
}

// Preview action - returns image buffer
export async function getPreview(formData: FormData) {
  'use server';
  checkAdminAuth();

  const templateFile = formData.get('template') as File;
  const previewName = (formData.get('previewName') as string) || 'Mr. & Mrs. Smith';

  if (!templateFile) {
    return new Response('Template file required', { status: 400 });
  }

  const options = {
    x: Number(formData.get('x') || 600),
    y: Number(formData.get('y') || 900),
    fontSize: Number(formData.get('fontSize') || 80),
    color: (formData.get('color') as string) || '#D4AF37',
    strokeColor: (formData.get('strokeColor') as string) || '#4a1c1c',
    strokeWidth: Number(formData.get('strokeWidth') || 4),
    font: (formData.get('font') as string) || 'PlayfairDisplay-Regular',
  };

  const previewBuffer = await generatePreview(templateFile, previewName, options);

  return new Response(previewBuffer, {
    headers: { 
      'Content-Type': 'image/jpeg', 
      'Cache-Control': 'no-store' 
    },
  });
}

