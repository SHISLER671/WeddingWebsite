'use server';

import { generatePersonalizedInvites } from '@/lib/invite-generator';

export async function generateInvites(formData: FormData) {
  try {
    const csvFile = formData.get('csv') as File | null;
    // Use master list if no CSV file is uploaded
    const useMasterList = !csvFile || csvFile.size === 0;

    // All settings are preset - same as preview
    const options = {
      fontSize: 80,
      color: '#7B4B7A', // Medium purple/plum to match invitation text color
      strokeColor: '#4a1c1c',
      strokeWidth: 4,
      font: 'serif', // Use system serif to avoid font loading issues
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
