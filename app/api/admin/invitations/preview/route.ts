import { NextRequest, NextResponse } from 'next/server';
import { generatePreview } from '@/lib/invite-generator';

export async function POST(request: NextRequest) {
  try {
    console.log('Preview API route called');
    const formData = await request.formData();
    const previewName = (formData.get('previewName') as string) || 'Mr. & Mrs. Smith';

    console.log('Preview name:', previewName);

    // All settings are preset - only name is needed
    const options = {
      fontSize: 80,
      color: '#D4AF37',
      strokeColor: '#4a1c1c',
      strokeWidth: 4,
      font: 'serif', // Use system serif to avoid font loading issues
      autoPosition: true,
    };

    console.log('Generating preview with options:', options);
    const previewBuffer = await generatePreview(previewName, options);
    console.log('Preview generated, buffer size:', previewBuffer.length);

    return new NextResponse(previewBuffer, {
      headers: { 
        'Content-Type': 'image/jpeg', 
        'Cache-Control': 'no-store' 
      },
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Preview generation failed';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
