'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { getPreview } from './actions';

export default function LivePreviewForm() {
  const searchParams = useSearchParams();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get guest name from URL query parameter, or use default
  const guestNameFromUrl = searchParams.get('guest');
  const defaultName = guestNameFromUrl ? decodeURIComponent(guestNameFromUrl) : 'Alexandra & Benjamin';
  
  const [formData, setFormData] = useState({
    x: 600,
    y: 900,
    fontSize: 80,
    color: '#D4AF37',
    strokeColor: '#4a1c1c',
    strokeWidth: 4,
    font: 'GreatVibes-Regular',
    previewName: defaultName,
  });

  // Update preview name when URL parameter changes
  useEffect(() => {
    if (guestNameFromUrl) {
      setFormData(prev => ({
        ...prev,
        previewName: decodeURIComponent(guestNameFromUrl),
      }));
    }
  }, [guestNameFromUrl]);

  async function updatePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const formDataObj = new FormData(form);
    
    // Ensure all current form values are included
    formDataObj.set('x', formData.x.toString());
    formDataObj.set('y', formData.y.toString());
    formDataObj.set('fontSize', formData.fontSize.toString());
    formDataObj.set('color', formData.color);
    formDataObj.set('strokeColor', formData.strokeColor);
    formDataObj.set('strokeWidth', formData.strokeWidth.toString());
    formDataObj.set('font', formData.font);
    formDataObj.set('previewName', formData.previewName);
    
    try {
      const response = await getPreview(formDataObj);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        // Clean up old URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(url);
        
        // Sync hidden fields in bulk form
        const bulkForm = document.getElementById('bulk-form') as HTMLFormElement;
        if (bulkForm) {
          const fields = ['x', 'y', 'fontSize', 'color', 'strokeColor', 'strokeWidth', 'font'];
          fields.forEach((field) => {
            const input = bulkForm.querySelector(`#bulk-${field}`) as HTMLInputElement;
            const value = formDataObj.get(field);
            if (input && value) {
              input.value = value.toString();
            }
          });
        }
      } else {
        console.error('Preview generation failed');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-jewel-burgundy">Live Preview – Tweak Until Perfect</h2>
      <form onSubmit={updatePreview} className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="template-preview">Template</Label>
            <Input 
              name="template" 
              id="template-preview" 
              type="file" 
              accept="image/*" 
              required 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Update form data and trigger preview
                  const form = e.target.form;
                  if (form) {
                    form.requestSubmit();
                  }
                }
              }} 
            />
          </div>
          <div>
            <Label htmlFor="previewName">Preview Name</Label>
            <Input 
              name="previewName" 
              id="previewName" 
              value={formData.previewName}
              onChange={(e) => setFormData({ ...formData, previewName: e.target.value })}
              placeholder="Test name" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="x">X Position</Label>
              <Input 
                name="x" 
                id="x" 
                type="number" 
                value={formData.x}
                onChange={(e) => setFormData({ ...formData, x: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="y">Y Position</Label>
              <Input 
                name="y" 
                id="y" 
                type="number" 
                value={formData.y}
                onChange={(e) => setFormData({ ...formData, y: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Input 
                name="fontSize" 
                id="fontSize" 
                type="number" 
                value={formData.fontSize}
                onChange={(e) => setFormData({ ...formData, fontSize: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="font">Font</Label>
              <Input 
                name="font" 
                id="font" 
                value={formData.font}
                onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                placeholder="GreatVibes-Regular" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Text Color</Label>
              <Input 
                name="color" 
                id="color" 
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10" 
              />
            </div>
            <div>
              <Label htmlFor="strokeColor">Outline Color</Label>
              <Input 
                name="strokeColor" 
                id="strokeColor" 
                type="color"
                value={formData.strokeColor}
                onChange={(e) => setFormData({ ...formData, strokeColor: e.target.value })}
                className="w-full h-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="strokeWidth">Outline Width</Label>
            <Input 
              name="strokeWidth" 
              id="strokeWidth" 
              type="number" 
              value={formData.strokeWidth}
              onChange={(e) => setFormData({ ...formData, strokeWidth: Number(e.target.value) })}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-jewel-burgundy hover:bg-jewel-crimson">
            {isLoading ? 'Generating Preview...' : 'Update Preview'}
          </Button>
        </div>

        <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden min-h-[400px]">
          {previewUrl ? (
            <Image 
              src={previewUrl} 
              alt="Live preview" 
              width={800} 
              height={1200} 
              className="max-w-full h-auto" 
            />
          ) : (
            <p className="text-gray-500">Upload a template and click Update Preview</p>
          )}
        </div>
      </form>
    </div>
  );
}

