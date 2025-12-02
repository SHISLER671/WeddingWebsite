import { NextRequest, NextResponse } from 'next/server';
import { generatePreview } from '@/lib/invite-generator';

export async function POST(request: NextRequest) {
  try {
    console.log('Preview API route called');
    const formData = await request.formData();
    const previewName = (formData.get('previewName') as string) || 'Mr. & Mrs. Smith';

    console.log('Preview name:', previewName);

    const options = {
      x: Number(formData.get('x') || 600),
      y: Number(formData.get('y') || 900),
      fontSize: Number(formData.get('fontSize') || 80),
      color: (formData.get('color') as string) || '#D4AF37',
      strokeColor: (formData.get('strokeColor') as string) || '#4a1c1c',
      strokeWidth: Number(formData.get('strokeWidth') || 4),
      font: (formData.get('font') as string) || 'PlayfairDisplay-Regular',
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
