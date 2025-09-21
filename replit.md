# Wedding Website 2026

## Overview
This is a wedding website project originally created with v0.app. The repository was imported fresh with only README and basic Replit config files. Created a Next.js wedding website from scratch to get it running in Replit environment.

## Project Architecture
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Host Configuration**: Configured for Replit proxy (0.0.0.0:5000 with allowedHosts: true)
- **Deployment**: Configured for Replit autoscale deployment

## Recent Changes
- 2025-09-17: Initial project setup in Replit environment
- Created basic Next.js wedding website with responsive design
- Configured proper host settings for Replit proxy support
- Set up workflow for development server on port 5000
- 2025-09-18: **MAJOR PROGRESS** - Implemented secure admin authentication system
- Fixed Supabase environment variables and client configuration
- Created functional admin dashboard with RSVP data access
- Attempted webpack/Storybook warning resolution in next.config.js
- Database setup complete with admin_users, rsvps, and seating_assignments tables

## User Preferences
- Clean, elegant design appropriate for wedding website
- Responsive layout for mobile and desktop
- Professional appearance with modern styling

## Current State
- ✅ Development server configured and running on port 5000
- ✅ Deployment configured for production (autoscale with build and start commands)  
- ✅ All Replit-specific configurations in place
- ✅ Next.js configuration optimized for Replit environment (0.0.0.0 host binding)
- ✅ Wedding website displaying correctly with responsive design
- ✅ TypeScript errors resolved
- ✅ **Admin authentication system fully functional** (BRIDE/GROOM/PLANNER access with individual secure passwords)
- ✅ **Supabase backend integrated** with real database queries and graceful fallbacks
- ✅ **RSVP management system** operational through admin dashboard
- ✅ Database tables created and ready for live data
- ⚠️ Minor webpack warning persists (Storybook dependency in thirdweb) - non-blocking
- ✅ **READY FOR GITHUB SYNC** - All core admin functions working perfectly
