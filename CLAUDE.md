# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js wedding website application for Ryan & Erin's February 2026 wedding. The project uses:
- Next.js 14 with App Router
- Supabase for database and authentication
- TypeScript
- Tailwind CSS with custom wedding theme colors
- Shadcn/ui components
- Web3/wallet integration (Abstract Global Wallet, Thirdweb, Privy)

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint (currently disabled during builds)

## Architecture & Key Patterns

### Database Integration
- **Supabase Setup**: Uses both client-side and server-side Supabase clients
- **Client Client**: `lib/supabase.ts` - Standard client with anon key for frontend
- **Server Client**: `lib/supabaseServer.ts` - Service role client for admin operations
- **Environment Variables**: 
  - `SUPABASE_URL` - Database URL
  - `SUPABASE_ANON_KEY` - Client-side key
  - `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin key

### API Routes
- **RSVP API**: `/app/api/rsvp/route.ts` - Main RSVP handling with fallback service role logic
- **Admin RSVP API**: `/api/admin/rsvps/route.ts` - Admin RSVP management
- **Legacy API**: `/api/rsvp/route.ts` - Older implementation still present

### Component Structure
- **Shadcn/ui**: Located in `components/ui/` with Radix UI primitives
- **Custom Components**: Wedding-specific components in `components/`
- **Theme**: Custom wedding colors (purple, magenta, gold, rose) in Tailwind config

### Authentication & Wallet Integration
- **Privy**: Cross-app authentication (`@privy-io/react-auth`, `@privy-io/cross-app-connect`)
- **Abstract Global Wallet**: Web3 wallet integration (`@abstract-foundation/agw-react`)
- **Thirdweb**: Web3 utilities and components

### Database Schema
- **RSVP Table**: Core table for guest responses with fields:
  - `guest_name`, `email`, `attendance`, `guest_count`
  - `dietary_restrictions`, `special_message`
  - `wallet_address` (for Web3 integration)
  - `created_at`, `updated_at`

### Configuration Notes
- **Next.js Config**: Custom webpack config for Thirdweb compatibility, environment variable injection
- **TypeScript**: Strict mode enabled with path aliases (`@/*` points to root)
- **Tailwind**: Custom color scheme with wedding theme and additional fonts (Playfair, Cormorant)

### Development Environment
- **Package Manager**: Uses pnpm (lock file present)
- **Build**: Currently configured to ignore TypeScript and ESLint errors during builds
- **Images**: Unoptimized images enabled for development
- **Security**: X-Frame-Options set to SAMEORIGIN

### Important Files
- `middleware.ts` - Authentication and request middleware
- `lib/utils.ts` - Shared utilities
- `app/layout.tsx` - Root layout with providers
- `app/providers.tsx` - React Query and theme providers

### Environment Setup
Requires these environment variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- Web3 wallet provider credentials
