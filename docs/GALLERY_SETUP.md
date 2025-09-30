# Wedding Gallery Setup Guide

This guide explains how to set up the photo/video gallery feature for the Pia & Ryan Wedding 2026 site.

## 🎯 Overview

The gallery allows authenticated users (those who have RSVP'd) to upload photos and videos that are displayed in a public grid view. All media is stored in Supabase Storage with metadata in a PostgreSQL table.

## 📋 Prerequisites

- Supabase project with existing RSVP functionality
- Next.js app deployed on Vercel
- Existing Supabase client configuration

## 🛠️ Setup Steps

### 1. Supabase Database Setup

Run the SQL script in your Supabase SQL Editor:

\`\`\`sql
-- Run: scripts/setup-gallery.sql
\`\`\`

This creates:
- `gallery_items` table with proper indexes
- RLS policies for public read, authenticated upload
- Foreign key constraint to RSVP emails
- Helper function for RSVP validation

### 2. Supabase Storage Setup

In your Supabase Dashboard:

1. **Create Storage Bucket**:
   - Go to Storage → Create Bucket
   - Name: `wedding-gallery`
   - Public: ✅ Yes

2. **Set Storage Policies**:
   - Go to Storage → wedding-gallery → Policies
   - Add these policies:

   **Public Read Policy**:
   - Operation: SELECT
   - Condition: `true`

   **Authenticated Upload Policy**:
   - Operation: INSERT
   - Condition: `true`

### 3. Code Files Added

- `lib/utils/gallery.ts` - Gallery utility functions
- `app/gallery/page.tsx` - Gallery page component
- `app/page.tsx` - Updated with Photo Gallery button
- `scripts/setup-gallery.sql` - Database setup script
- `docs/GALLERY_SETUP.md` - This guide

## 🧪 Testing

### 1. Test Upload Functionality

1. Go to https://pia-ryan-wedding.vercel.app/gallery
2. Click "Share a Memory" button
3. Upload the `rockfrogs.jpg` sample image
4. Enter an email that exists in your RSVP database
5. Add caption: "Beautiful stone carvings from our wedding"
6. Click Upload

### 2. Verify Results

- ✅ Image appears in gallery grid
- ✅ Image stored in Supabase Storage
- ✅ Metadata saved to `gallery_items` table
- ✅ Responsive design works on mobile/desktop

### 3. Test Different File Types

- **Images**: JPG, PNG, WebP, GIF
- **Videos**: MP4, MOV, WebM
- **File Size**: Up to 10MB limit

## 🎨 Features

### Gallery Page
- **Responsive Grid**: 1-4 columns based on screen size
- **Media Support**: Images and videos with proper controls
- **Hover Effects**: Caption and date overlay on hover
- **File Type Icons**: Camera for images, Video for videos
- **Loading States**: Smooth loading animations

### Upload Modal
- **Drag & Drop**: Intuitive file selection
- **File Validation**: Type and size checking
- **Email Verification**: Must match RSVP email
- **Caption Support**: Optional descriptions
- **Status Feedback**: Success/error messages

### Authentication
- **RSVP-Based**: Only users who RSVP'd can upload
- **Email Validation**: Checks against existing RSVPs
- **Public Viewing**: Anyone can view the gallery

## 🔧 Configuration

### File Upload Limits
\`\`\`typescript
// In app/gallery/page.tsx
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/*', 'video/*']
\`\`\`

### Image Optimization
\`\`\`typescript
// In lib/utils/gallery.ts
export function getOptimizedImageUrl(filePath: string, width: number = 400): string {
  return `${data.publicUrl}?width=${width}&quality=80&format=webp`
}
\`\`\`

### Grid Responsiveness
\`\`\`css
/* In app/gallery/page.tsx */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
\`\`\`

## 🚀 Deployment

The gallery feature is ready for deployment:

1. **Commit Changes**:
   \`\`\`bash
   git add .
   git commit -m "Add wedding gallery feature with Supabase Storage"
   git push origin main
   \`\`\`

2. **Vercel Deployment**:
   - Automatic deployment via GitHub
   - Gallery available at `/gallery`
   - All existing functionality preserved

3. **Supabase Setup**:
   - Run the SQL script
   - Create storage bucket
   - Set storage policies

## 🔍 Troubleshooting

### Common Issues

1. **Upload Fails**:
   - Check Supabase Storage bucket exists
   - Verify RLS policies are set
   - Ensure email matches RSVP

2. **Images Not Displaying**:
   - Check file paths in database
   - Verify storage bucket is public
   - Check browser console for errors

3. **Authentication Issues**:
   - Verify RSVP email exists in database
   - Check foreign key constraint
   - Test with known RSVP email

### Debug Queries

\`\`\`sql
-- Check gallery items
SELECT * FROM gallery_items ORDER BY created_at DESC;

-- Check RSVP emails
SELECT email FROM rsvps WHERE email = 'test@example.com';

-- Check storage files
SELECT * FROM storage.objects WHERE bucket_id = 'wedding-gallery';
\`\`\`

## 📊 Monitoring

### Database Queries
- Monitor `gallery_items` table growth
- Track upload frequency by email
- Check for failed uploads

### Storage Usage
- Monitor Supabase Storage usage
- Check file sizes and types
- Optimize images if needed

### Performance
- Gallery loads with lazy loading
- Images optimized with WebP format
- Responsive grid for all devices

## 🎉 Success Criteria

- ✅ Gallery page loads at `/gallery`
- ✅ Upload form works with RSVP validation
- ✅ Images display in responsive grid
- ✅ Videos play with proper controls
- ✅ Mobile-friendly design
- ✅ No impact on existing functionality
- ✅ Supabase Storage integration working
- ✅ Sample image (rockfrogs.jpg) uploads successfully

---

**Status**: Ready for deployment
**Last Updated**: $(date)
**Next Steps**: Deploy to Vercel and test with sample image
