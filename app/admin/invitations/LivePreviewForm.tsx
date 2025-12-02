'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  // Update preview name when URL parameter changes and auto-load preview
  useEffect(() => {
    const currentName = guestNameFromUrl ? decodeURIComponent(guestNameFromUrl) : defaultName;
    
    if (guestNameFromUrl) {
      setFormData(prev => ({
        ...prev,
        previewName: currentName,
      }));
    }
    
    // Auto-load preview on mount or when guest name changes
    const loadPreview = async () => {
      setIsLoading(true);
      const freshFormData = new FormData();
      freshFormData.append('x', '600');
      freshFormData.append('y', '900');
      freshFormData.append('fontSize', '80');
      freshFormData.append('color', '#D4AF37');
      freshFormData.append('strokeColor', '#4a1c1c');
      freshFormData.append('strokeWidth', '4');
      freshFormData.append('font', 'GreatVibes-Regular');
      freshFormData.append('previewName', currentName);
      
      try {
        const response = await fetch('/api/admin/invitations/preview', {
          method: 'POST',
          body: freshFormData,
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPreviewUrl(prev => {
            if (prev) {
              URL.revokeObjectURL(prev);
            }
            return url;
          });
        }
      } catch (error) {
        console.error('Error auto-loading preview:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestNameFromUrl]);

  async function updatePreview(e?: React.FormEvent<HTMLFormElement>) {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);
    
    // Create FormData with current settings (no template file needed)
    const freshFormData = new FormData();
    freshFormData.append('x', formData.x.toString());
    freshFormData.append('y', formData.y.toString());
    freshFormData.append('fontSize', formData.fontSize.toString());
    freshFormData.append('color', formData.color);
    freshFormData.append('strokeColor', formData.strokeColor);
    freshFormData.append('strokeWidth', formData.strokeWidth.toString());
    freshFormData.append('font', formData.font);
    freshFormData.append('previewName', formData.previewName);
    
    console.log('Sending preview request:', {
      previewName: formData.previewName,
      x: formData.x,
      y: formData.y,
    });
    
    try {
      const response = await fetch('/api/admin/invitations/preview', {
        method: 'POST',
        body: freshFormData,
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Received blob, size:', blob.size);
        const url = URL.createObjectURL(blob);
        // Clean up old URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(url);
        console.log('Preview URL created:', url);
        
        // Sync hidden fields in bulk form
        const bulkForm = document.getElementById('bulk-form') as HTMLFormElement;
        if (bulkForm) {
          const fields = ['x', 'y', 'fontSize', 'color', 'strokeColor', 'strokeWidth', 'font'];
          fields.forEach((field) => {
            const input = bulkForm.querySelector(`#bulk-${field}`) as HTMLInputElement;
            const value = freshFormData.get(field);
            if (input && value) {
              input.value = value.toString();
            }
          });
        }
      } else {
        const errorText = await response.text();
        console.error('Preview generation failed:', response.status, errorText);
        let errorMessage = 'Unknown error';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        alert(`Preview generation failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-jewel-burgundy">Live Preview – Tweak Until Perfect</h2>
      <form onSubmit={updatePreview} className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-4 bg-jewel-gold/10 rounded-lg border border-jewel-gold/20">
            <p className="text-sm text-jewel-burgundy">
              <strong>Template:</strong> Using <code>invitetemplate.jpg</code> from public folder
            </p>
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
            <img 
              src={previewUrl} 
              alt="Live preview" 
              className="max-w-full h-auto" 
            />
          ) : (
            <p className="text-gray-500">Click Update Preview to generate preview</p>
          )}
        </div>
      </form>
    </div>
  );
}
