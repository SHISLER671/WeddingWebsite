'use server';

import { generatePersonalizedInvites } from '@/lib/invite-generator';

export async function generateInvites(formData: FormData) {
  try {
    const csvFile = formData.get('csv') as File | null;
    // Use master list if no CSV file is uploaded
    const useMasterList = !csvFile || csvFile.size === 0;

    const options = {
      x: Number(formData.get('x') || 600),
      y: Number(formData.get('y') || 900),
      fontSize: Number(formData.get('fontSize') || 80),
      color: (formData.get('color') as string) || '#D4AF37',
      strokeColor: (formData.get('strokeColor') as string) || '#4a1c1c',
      strokeWidth: Number(formData.get('strokeWidth') || 4),
      font: (formData.get('font') as string) || 'PlayfairDisplay-Regular',
      useMasterList: useMasterList,
    };

    console.log('Generating invites with options:', { ...options, csvFile: csvFile ? csvFile.name : 'using master list' });
    const zipBuffer = await generatePersonalizedInvites(csvFile, options);
    console.log('Generated ZIP buffer, size:', zipBuffer.length);

    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=personalized-wedding-invitations.zip',
      },
    });
  } catch (error) {
    console.error('Error in generateInvites:', error);
    throw new Error(`Failed to generate invites: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
