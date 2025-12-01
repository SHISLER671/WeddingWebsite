'use server';

import { generatePersonalizedInvites } from '@/lib/invite-generator';

export async function generateInvites(formData: FormData) {

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
