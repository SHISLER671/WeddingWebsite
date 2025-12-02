import { Suspense } from 'react';
import { generateInvites } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LivePreviewForm from './LivePreviewForm';

export const dynamic = 'force-dynamic';

export default async function InvitationsPage() {

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
            <div className="p-4 bg-jewel-gold/10 rounded-lg border border-jewel-gold/20 mb-4">
              <p className="text-sm text-jewel-burgundy mb-2">
                <strong>Template:</strong> Using <code>invitetemplate.jpg</code> from public folder
              </p>
              <p className="text-sm text-jewel-burgundy">
                <strong>Guest List:</strong> Using <code>MASTERGUESTLIST.csv</code> (default) or upload custom CSV below
              </p>
            </div>
            <div>
              <Label htmlFor="csv">Custom Guest List CSV (Optional)</Label>
              <Input name="csv" id="csv" type="file" accept=".csv" />
              <p className="text-sm text-gray-600 mt-2">
                Leave empty to use MASTERGUESTLIST.csv, or upload a custom CSV file
              </p>
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
