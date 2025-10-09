# Pia & Ryan's Wedding Website 💍

A modern, full-featured wedding website built with Next.js, featuring RSVP management, AI chatbot assistant, photo gallery, and crypto gift integration.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

## 🌟 Features

### Core Features
- **RSVP System** - Secure guest registration and management with Supabase backend
- **AI Wedding Assistant** - "Ezekiel" chatbot powered by OpenRouter AI to answer guest questions
- **Photo Gallery** - Upload and share wedding photos with captions and comments
- **Wedding Information** - Detailed event information, venue details, and FAQ
- **Contact Page** - Easy way for guests to reach out with questions

### Modern Tech Features
- **Crypto Gifts** - Accept cryptocurrency gifts via Abstract Global Wallet
- **Wallet Connection** - Guests can connect wallets for digital wedding favors
- **Responsive Design** - Fully optimized for mobile and desktop experiences
- **Real-time Updates** - Live data synchronization with Supabase
- **Security** - Server-side authentication and encrypted RSVP lookup

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

```
debugWW2026/
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
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account and project
- OpenRouter API key
- Abstract wallet configuration (optional)

### Environment Variables
Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter AI
OPENROUTER_API_KEY=your_openrouter_api_key

# Abstract Global Wallet (optional)
NEXT_PUBLIC_AGW_PROJECT_ID=your_agw_project_id

# Encryption (for RSVP lookup)
ENCRYPTION_KEY=your_32_byte_encryption_key
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

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

## 👥 Credits

Built with love for Pia & Ryan's wedding celebration 💕

**Wedding Date:** February 2026  
**Location:** Paradise Island 🌴

---

*Island vibes meet future tech* 🌺✨