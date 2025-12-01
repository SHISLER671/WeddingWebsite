import { NextRequest, NextResponse } from 'next/server';
import { generatePreview } from '@/lib/invite-generator';

export async function POST(request: NextRequest) {
  try {

    const formData = await request.formData();
    const templateFile = formData.get('template') as File;
    const previewName = (formData.get('previewName') as string) || 'Mr. & Mrs. Smith';

    if (!templateFile || templateFile.size === 0) {
      return NextResponse.json({ error: 'Template file required' }, { status: 400 });
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

    return new NextResponse(previewBuffer, {
      headers: { 
        'Content-Type': 'image/jpeg', 
        'Cache-Control': 'no-store' 
      },
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Preview generation failed' },
      { status: 500 }
    );
  }
}

