# Pia & Ryan's Wedding Website 💍

> **February 13, 2026** • A luxury wedding website with modern tech features

A sophisticated, full-featured wedding website built with Next.js 15 (App Router) and React 19, featuring elegant design, RSVP management, AI chatbot assistant, photo gallery, and crypto gift integration. Designed with unified jewel-tone aesthetics and optimized for wedding guests of all ages.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

## 🌟 Features

### 💒 Wedding Essentials
- **📅 Live Countdown** - Real-time countdown to February 13, 2026
- **📝 RSVP System** - Secure guest registration with dietary restrictions and guest counts, with edit mode
- **🪑 Seating Lookup** - Seating assignment lookup and Admin seating dashboard
- **✅ Confirmation Page** - Personalized confirmation with follow-up actions (wallet connect, gallery, info)
- **📸 Photo Gallery** - Upload and share wedding photos/videos directly from the gallery page (no QR code needed)
- **ℹ️ Wedding Info** - Detailed event information, venue details, and FAQ
- **📞 Contact** - Easy way for guests to reach out with questions

### 🤖 AI & Automation
- **💬 AI Wedding Assistant** - "Ezekiel" chatbot powered by OpenRouter AI with automatic retry logic
- **🎯 Smart Responses** - Answers questions about wedding details, directions, logistics, and RSVP status
- **🔐 Secure Lookup** - Encrypted RSVP lookup system for guest privacy
- **🛡️ Safety Features** - Prevents misinformation, rate limiting, and error handling with exponential backoff
- **📚 Accurate Information** - Verified knowledge base with strict rules against fabricating wedding details

### 💎 Modern Tech Features
- **🎁 Gift Options** - Handmade art/crafts, traditional cash gifts, and crypto gifts (no traditional registry)
- **💰 Crypto Gifts** - Accept cryptocurrency gifts via Abstract Global Wallet
- **🔗 Wallet Connection** - Optional wallet connection for post-wedding digital surprises
- **📱 Mobile-First** - Fully optimized for mobile and desktop experiences with touch-friendly UI
- **⚡ Real-time Updates** - Live data synchronization with Supabase
- **🛡️ Security** - Server-side authentication and encrypted data handling

### 🎨 Design & UX
- **💎 Jewel-Tone Aesthetics** - Rich burgundy, fuchsia, gold, and rose color palette
- **✨ Smooth Animations** - Elegant transitions and touch feedback
- **📱 Touch Optimized** - Mobile gestures and responsive interactions
- **♿ Accessible** - WCAG compliant for all guests

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React 19 with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom CSS variables (see `app/globals.css`) and theme (`tailwind.config.ts`)
- **Shadcn/ui** - Beautiful, accessible component library
- **Fonts via `next/font`** - Playfair Display (headings) and Lato (body) configured in `app/layout.tsx`

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Server Client Pattern** - Use `createClient()` from `@/lib/supabase/server` for server-side operations
- **Next.js API Routes** - Serverless API endpoints (App Router)
- **Server-side Auth** - Secure authentication flow

### Integrations
- **OpenRouter AI** - Powers the wedding chatbot with various LLM models
- **Abstract Global Wallet (AGW)** - Web3 wallet integration for crypto gifts
- **Wagmi** - React hooks for Ethereum wallet connections
- **Vercel** - Deployment and hosting platform

## 📁 Project Structure

\`\`\`
WeddingWebsite2026/
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions for gallery
│   ├── api/               # API routes (chat, gallery, RSVP)
│   ├── confirmation/      # RSVP confirmation page
│   ├── contact/           # Contact page
│   ├── gallery/           # Photo gallery page
│   ├── gifts/             # Gifts and crypto wallet page
│   ├── info/              # Wedding information page
│   ├── rsvp/              # RSVP form page
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── WeddingChatbot/   # Chatbot components
│   ├── ProfileMenu.tsx   # Wallet connection menu
│   └── ui/               # Reusable UI components
├── contexts/              # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configs
│   ├── supabase/         # Supabase client configs
│   ├── auth.ts           # Authentication helpers
│   ├── chatbot-config.ts # Chatbot configuration
│   └── openrouter.ts     # OpenRouter API integration
├── public/                # Static assets (images)
└── docs/                  # Documentation files
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account and project
- OpenRouter API key
- Abstract wallet configuration (optional)

### Environment Variables
Create a `.env.local` file with:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter AI
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini  # Optional: specify model (defaults to gpt-4o-mini)
NEXT_PUBLIC_OPENROUTER_MODEL=openai/gpt-4o-mini  # Optional: public model name

# Abstract Global Wallet (optional)
NEXT_PUBLIC_AGW_PROJECT_ID=your_agw_project_id

# Encryption (for RSVP lookup)
ENCRYPTION_KEY=your_32_byte_encryption_key
\`\`\`

### Installation

\`\`\`bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

> **Vercel Tip:** Use `pnpm install --no-frozen-lockfile` in build settings to avoid lockfile conflicts.

Visit [http://localhost:3000](http://localhost:3000) to see the website.

## 📊 Database Setup

The project uses Supabase with the following main tables:
- `invited_guests` - Master guest list synchronized with MASTERGUESTLIST.csv
- `rsvps` - Guest RSVP data with encrypted lookup codes
- `seating_assignments` - Table and seat assignments for confirmed guests
- `gallery_items` - Wedding photo/video gallery with metadata and captions

SQL setup scripts are available in the `scripts/` directory.

## 🤖 AI Chatbot

The wedding chatbot "Ezekiel" is powered by OpenRouter and can:
- Answer questions about the wedding (date, venue, dress code, etc.)
- Provide directions and accommodation info
- Explain gift options (handmade art, cash, crypto - no traditional registry)
- Help with RSVP-related questions and check RSVP status
- Offer seating information for confirmed guests
- Guide guests through photo gallery uploads (direct upload, no QR code)
- Provide accurate, verified information with strict safety rules against misinformation

### Chatbot Features
- **Automatic Retry Logic** - Handles rate limits with exponential backoff
- **Error Handling** - Detailed logging and user-friendly error messages
- **Rate Limiting** - Client-side and API-side limits to prevent abuse
- **Safety Protocols** - Never fabricates information, always directs to couple when uncertain
- **First-Time User Friendly** - Patient guidance for guests new to AI assistants

Configuration is managed in `lib/chatbot-config.ts`. The chatbot appears globally on all pages except the home landing page.

## 💎 Gift Options & Crypto Integration

### Gift Options (No Traditional Registry)
The couple offers three gift options:
1. **Handmade Art & Crafts** - Paintings, drawings, pottery, jewelry, or any craft made with love
2. **Traditional Cash Gifts** - Always appreciated to help build their new life together
3. **Crypto Gifts** - Via Abstract Global Wallet for crypto-curious guests

### Crypto Integration
Guests can:
- Send crypto gifts (ETH, USDC) via Abstract Global Wallet
- Optionally connect their wallets for post-wedding digital surprises
- View wallet connection status in the profile menu

The integration uses Abstract's AGW SDK (AbstractWalletProvider) for wallet management. Wallet connection is completely optional.

## 📝 Documentation

Additional documentation available in `/docs`:
- `GALLERY_SETUP.md` - Gallery feature setup
- `MOBILE_COMPATIBILITY.md` - Mobile optimization notes
- `SUPABASE_KEEP_ALIVE.md` - Database connection management
- `WEDDING_CHATBOT.md` - Chatbot implementation details

## 🎨 Customization

### Theme Colors
Defined in `tailwind.config.ts` and `app/globals.css`:
- **Jewel Tones:** Burgundy, Crimson, Fuchsia, Purple, Violet, Sapphire, Emerald, Rose, Gold
- **Neutrals:** Soft Blush, Warm White, Charcoal
- **Custom Utilities:** Gold shimmer effects and glass-morphism utilities available in `app/globals.css`
- **Unified Theme:** All pages and components use the consistent jewel-tone palette standardized site-wide

### Content Updates
- Wedding details: `lib/chatbot-config.ts`
- Homepage hero: `app/page.tsx`
- Info page: `app/info/page.tsx`
- Gifts page: `app/gifts/page.tsx`

## 🚢 Deployment

The site is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📄 License

This is a private wedding website project. All rights reserved.

## 🎯 Key Improvements Made

### Performance & Reliability
- ✅ **Fixed Supabase Keep-Alive** - Automated weekly pings prevent 7-day inactivity pause
- ✅ **Optimized Dependencies** - Cleaned up duplicate packages for faster builds
- ✅ **Enhanced Error Handling** - Robust retry logic with exponential backoff for chatbot API calls
- ✅ **Mobile Optimization** - Touch gestures, smooth animations, and responsive design
- ✅ **Chatbot Rate Limiting** - Client-side and API-side limits prevent abuse and manage costs
- ✅ **Database Synchronization** - Scripts to sync invited_guests and seating_assignments tables

### Security & Privacy
- 🔐 **Encrypted RSVP Lookup** - Secure guest data with 32-byte encryption
- 🛡️ **Server-side Authentication** - Protected API endpoints and data access
- 🔒 **Environment Variables** - Secure configuration management

### User Experience
- 💎 **Jewel-Tone Design** - Rich burgundy, fuchsia, gold, and rose color palette
- ✨ **Smooth Animations** - Elegant transitions and touch feedback
- 📱 **Mobile-First** - Optimized for all devices and touch interactions
- ♿ **Accessibility** - WCAG compliant for all guests
- 🤖 **AI Chatbot** - Global availability on all pages (except home) with accurate, verified information
- 📸 **Easy Photo Uploads** - Direct upload from gallery page, no QR code needed

## 🚀 Deployment Status

- **Production:** [pia-ryan-wedding.vercel.app](https://pia-ryan-wedding.vercel.app)
- **GitHub Actions:** Automated Supabase keep-alive (Sundays 2 AM ChST)
- **Monitoring:** Real-time error tracking and performance monitoring

## 👥 Credits

Built with love for Pia & Ryan's wedding celebration 💕

**Wedding Date:** February 13, 2026  
**Location:** Guam 🌴

---

*Island vibes meet future tech* 🌺✨
