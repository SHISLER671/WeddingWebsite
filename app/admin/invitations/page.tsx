import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { verifyToken } from '@/lib/auth';
import { generateInvites, getPreview } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LivePreviewForm from './LivePreviewForm';

export const dynamic = 'force-dynamic';

// Auth check that verifies the token
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

export default async function InvitationsPage() {
  checkAdminAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-jewel-burgundy to-jewel-crimson py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-playfair text-white text-center mb-10">
          Personalized Wedding Invitations
        </h1>

        <Suspense fallback={<div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">Loading...</div>}>
          <LivePreviewForm />
        </Suspense>

        <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-jewel-burgundy">Bulk Generate All Invitations</h2>
          <form action={generateInvites} className="space-y-6" id="bulk-form">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="csv">Guest List CSV</Label>
                <Input name="csv" id="csv" type="file" accept=".csv" required />
              </div>
              <div>
                <Label htmlFor="template-bulk">Template Image</Label>
                <Input name="template" id="template-bulk" type="file" accept="image/*" required />
              </div>
            </div>

            {/* Hidden fields — synced from live preview */}
            <input type="hidden" name="x" id="bulk-x" value="600" />
            <input type="hidden" name="y" id="bulk-y" value="900" />
            <input type="hidden" name="fontSize" id="bulk-fontSize" value="80" />
            <input type="hidden" name="color" id="bulk-color" value="#D4AF37" />
            <input type="hidden" name="strokeColor" id="bulk-strokeColor" value="#4a1c1c" />
            <input type="hidden" name="strokeWidth" id="bulk-strokeWidth" value="4" />
            <input type="hidden" name="font" id="bulk-font" value="PlayfairDisplay-Regular" />

            <Button type="submit" size="lg" className="w-full bg-jewel-burgundy hover:bg-jewel-crimson">
              Generate & Download ZIP
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

