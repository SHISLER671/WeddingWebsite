# Pia & Ryan's Wedding Website 💍

> **February 13, 2026** • A luxury wedding website with modern tech features

A sophisticated, full-featured wedding website built with Next.js 14, featuring elegant design, RSVP management, AI chatbot assistant, photo gallery, and crypto gift integration. Designed with jewel-tone aesthetics and optimized for wedding guests of all ages.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

## 🌟 Features

### 💒 Wedding Essentials
- **📅 Live Countdown** - Real-time countdown to February 13, 2026
- **📝 RSVP System** - Secure guest registration with dietary restrictions and guest counts
- **📸 Photo Gallery** - Upload and share wedding photos with captions and comments
- **ℹ️ Wedding Info** - Detailed event information, venue details, and FAQ
- **📞 Contact** - Easy way for guests to reach out with questions

### 🤖 AI & Automation
- **💬 AI Wedding Assistant** - "Ezekiel" chatbot powered by OpenRouter AI
- **🎯 Smart Responses** - Answers questions about wedding details, directions, and logistics
- **🔐 Secure Lookup** - Encrypted RSVP lookup system for guest privacy

### 💎 Modern Tech Features
- **💰 Crypto Gifts** - Accept cryptocurrency gifts via Abstract Global Wallet
- **🔗 Wallet Connection** - Guests can connect wallets for digital wedding surprises
- **📱 Mobile-First** - Fully optimized for mobile and desktop experiences
- **⚡ Real-time Updates** - Live data synchronization with Supabase
- **🛡️ Security** - Server-side authentication and encrypted data handling

### 🎨 Design & UX
- **💎 Jewel-Tone Aesthetics** - Rich burgundy, fuchsia, gold, and rose color palette
- **✨ Smooth Animations** - Elegant transitions and touch feedback
- **📱 Touch Optimized** - Mobile gestures and responsive interactions
- **♿ Accessible** - WCAG compliant for all guests

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful, accessible component library

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Next.js API Routes** - Serverless API endpoints
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

Visit [http://localhost:3000](http://localhost:3000) to see the website.

## 📊 Database Setup

The project uses Supabase with the following main tables:
- `rsvps` - Guest RSVP data with encrypted lookup codes
- `gallery` - Wedding photo gallery with metadata
- `gallery_comments` - Comments on gallery photos

SQL setup scripts are available in the `scripts/` directory.

## 🤖 AI Chatbot

The wedding chatbot "Ezekiel" is powered by OpenRouter and can:
- Answer questions about the wedding (date, venue, dress code, etc.)
- Provide directions and accommodation info
- Explain crypto gift options
- Help with RSVP-related questions
- Offer seating information

Configuration is managed in `lib/chatbot-config.ts`.

## 💎 Crypto Integration

Guests can:
- Send crypto gifts (ETH, USDC) via Abstract Global Wallet
- Connect their wallets for post-wedding digital surprises
- View wallet connection status in the profile menu

The integration uses Abstract's AGW SDK and Wagmi for wallet management.

## 📝 Documentation

Additional documentation available in `/docs`:
- `GALLERY_SETUP.md` - Gallery feature setup
- `MOBILE_COMPATIBILITY.md` - Mobile optimization notes
- `SUPABASE_KEEP_ALIVE.md` - Database connection management
- `WEDDING_CHATBOT.md` - Chatbot implementation details

## 🎨 Customization

### Theme Colors
Defined in `tailwind.config.ts`:
- Rose gold, jewel tones (crimson, fuchsia, burgundy)
- Soft blush and warm neutrals
- Island-inspired emerald and gold accents

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
- ✅ **Enhanced Error Handling** - Robust retry logic and better error reporting
- ✅ **Mobile Optimization** - Touch gestures, smooth animations, and responsive design

### Security & Privacy
- 🔐 **Encrypted RSVP Lookup** - Secure guest data with 32-byte encryption
- 🛡️ **Server-side Authentication** - Protected API endpoints and data access
- 🔒 **Environment Variables** - Secure configuration management

### User Experience
- 💎 **Jewel-Tone Design** - Rich burgundy, fuchsia, gold, and rose color palette
- ✨ **Smooth Animations** - Elegant transitions and touch feedback
- 📱 **Mobile-First** - Optimized for all devices and touch interactions
- ♿ **Accessibility** - WCAG compliant for all guests

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
