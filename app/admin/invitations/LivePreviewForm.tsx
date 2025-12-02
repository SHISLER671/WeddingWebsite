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
  
  // All settings are preset - only name is editable
  const [previewName, setPreviewName] = useState(defaultName);

  // Load preview function
  const loadPreview = async (name: string) => {
    setIsLoading(true);
    const freshFormData = new FormData();
    freshFormData.append('previewName', name);
    
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
      } else {
        const errorText = await response.text();
        console.error('Preview failed:', errorText);
        alert(`Preview failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update preview name when URL parameter changes and auto-load preview
  useEffect(() => {
    const currentName = guestNameFromUrl ? decodeURIComponent(guestNameFromUrl) : defaultName;
    
    if (guestNameFromUrl) {
      setPreviewName(currentName);
    }
    
    // Auto-load preview on mount or when guest name changes
    loadPreview(currentName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestNameFromUrl]);

  async function updatePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await loadPreview(previewName);
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-jewel-burgundy">Live Preview</h2>
      <form onSubmit={updatePreview} className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-4 bg-jewel-gold/10 rounded-lg border border-jewel-gold/20">
            <p className="text-sm text-jewel-burgundy mb-2">
              <strong>Template:</strong> Using <code>invitetemplate.jpg</code> from public folder
            </p>
            <p className="text-sm text-jewel-burgundy">
              <strong>Settings:</strong> All styling and positioning are automatic and preset
            </p>
          </div>
          
          <div>
            <Label htmlFor="previewName">Guest Name</Label>
            <Input 
              name="previewName" 
              id="previewName" 
              value={previewName}
              onChange={(e) => setPreviewName(e.target.value)}
              placeholder="Enter guest name" 
              className="text-lg"
            />
            <p className="text-sm text-gray-600 mt-2">
              Enter the guest name to preview on the invitation
            </p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-jewel-burgundy hover:bg-jewel-crimson text-lg py-6">
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
            <p className="text-gray-500">Enter a name and click Update Preview</p>
          )}
        </div>
      </form>
    </div>
  );
}
