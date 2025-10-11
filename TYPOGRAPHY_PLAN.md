# Wedding Website Typography Audit & Plan

## Current Setup

**Fonts Loaded:**
- **Playfair Display** (Serif) - Elegant, romantic serif font
- **Lato** (Sans-serif) - Clean, professional sans-serif font

**Tailwind Config:**
- `font-serif` = Playfair Display
- `font-sans` = Lato (default body font)

---

## Current Font Usage Analysis

### 🏠 Landing Page (`/`)
- **Main Header "Pia & Ryan"**: `font-serif font-semibold` (Playfair Display, 600 weight)
- **Date**: `font-sans font-light` (Lato Light)
- **Countdown badges**: `font-semibold` / `font-bold`
- **Navigation buttons**: `font-sans font-medium`

✅ **Status**: PERFECT! This is our reference standard.

---

### 📋 RSVP Page (`/rsvp`)
- **Page Title "RSVP"**: `font-serif` (Playfair) ✅
- **Section heading "Find Your RSVP"**: `font-serif` ✅
- **Body text**: Default (Lato)
- **Form labels**: `font-semibold`
- **Buttons**: Default

✅ **Status**: GOOD - Follows landing page pattern

---

### 🎁 Gifts Page (`/gifts`)
- **Page Title "Your Presence is Our Present"**: `font-light` (NO serif specified) ❌
- **Section headings**: Uses default font
- **Body text**: Default (Lato)
- **Wallet address label**: `font-medium`
- **Quote text**: `font-medium` / `font-semibold`
- **Buttons**: `font-semibold`

❌ **Status**: INCONSISTENT - Missing serif on main title

---

### ℹ️ Info Page (`/info`)
- **Page Title "Our Special Day"**: `font-serif font-bold` ✅
- **Subtitle**: `font-medium`
- **Section headings (When/Where/Dress)**: `font-serif font-bold` ✅
- **Strong labels**: `font-semibold`
- **Body text**: `font-sans` (explicit)
- **FAQ summaries**: `font-bold` (no serif/sans specified)
- **Venue headings**: `font-serif font-bold` ✅
- **Wedding Party titles**: `font-serif font-bold` ✅

⚠️ **Status**: MOSTLY GOOD - Some inconsistencies in FAQ and details

---

### 📸 Gallery Page (`/gallery`)
- **Page Title "Wedding Memories"**: `font-light` (NO serif specified) ❌
- **Subtitle**: `font-light` (default)
- **Buttons "Share a Memory"**: `font-medium` ✅
- **Modal header "Share a Memory"**: `font-semibold` ✅
- **Form labels**: `font-medium` ✅
- **Caption uploader names**: `font-semibold` ✅
- **Spotify section "The Soundtrack to Our Story"**: `font-semibold text-jewel-fuchsia` (NO serif specified) ❌
- **Body text**: Default (Lato) ✅
- **Empty state**: `font-semibold` ✅

❌ **Status**: INCONSISTENT - Main title and Spotify section header missing serif font

---

### ✅ Confirmation Page (`/confirmation`)
- **Page Title "Thank You"**: `font-light` (NO serif specified) ❌
- **Subtitle**: `font-light` / `font-medium`
- **Section headings**: `font-light` / `font-medium`
- **Body text**: Default (Lato)

❌ **Status**: INCONSISTENT - Missing serif styling on headers

---

## 🎨 Proposed Typography System

### HIERARCHY (4 Font Styles)

#### 1. **Hero Headers** - "The Showstoppers"
- **Font**: `font-serif font-semibold` (Playfair Display 600)
- **Use For**: 
  - Main page titles (Pia & Ryan, RSVP, Our Special Day, etc.)
  - Landing page hero text
- **Classes**: `font-serif font-semibold`
- **Vibe**: Romantic, elegant, memorable

#### 2. **Section Headers** - "The Organizers"
- **Font**: `font-serif font-bold` (Playfair Display 700)
- **Use For**:
  - Major section headings (When, Where, Wedding Party, etc.)
  - Card titles
  - Important subsections
- **Classes**: `font-serif font-bold`
- **Vibe**: Structured, important, authoritative

#### 3. **Body Text** - "The Storyteller"
- **Font**: `font-sans` (Lato 400) - DEFAULT
- **Use For**:
  - Paragraphs
  - Descriptions
  - General content
  - Form inputs
- **Classes**: `font-sans` (or just default)
- **Vibe**: Clean, readable, professional

#### 4. **Emphasis/Details** - "The Accent Pieces"
- **Font**: `font-sans font-medium` or `font-sans font-semibold`
- **Use For**:
  - Buttons (medium)
  - Form labels (semibold)
  - Important inline text (semibold)
  - Badges/tags (semibold)
  - Special notes (medium)
- **Classes**: 
  - Buttons: `font-sans font-medium`
  - Labels: `font-sans font-semibold`
  - Inline emphasis: `font-sans font-semibold`
- **Vibe**: Professional but friendly, calls to action

---

## 🔧 Fixes Needed

### High Priority (Inconsistent Headers)

1. **Gifts Page** (`/gifts`):
   - ❌ Change: `font-light` → `font-serif font-semibold`
   - Location: "Your Presence is Our Present" title

2. **Confirmation Page** (`/confirmation`):
   - ❌ Change: `font-light` → `font-serif font-semibold`
   - Location: "Thank You" title
   - ❌ Change: Section headings → `font-serif font-bold` OR keep `font-light` (decide based on tone)

3. **Gallery Page** (`/gallery`):
   - ❌ Change: `font-light` → `font-serif font-semibold`
   - Location: "Wedding Memories" main title (line 250)
   - ❌ Change: `font-semibold text-jewel-fuchsia` → `font-serif font-bold text-jewel-fuchsia`
   - Location: "The Soundtrack to Our Story" spotify section header (line 575)

### Medium Priority (Details & Polish)

4. **Info Page** (`/info`):
   - ⚠️ Make explicit font declarations on:
     - FAQ question text (add `font-sans font-bold`)
     - Ensure all strong/em text uses appropriate weights

5. **RSVP Page** (`/rsvp`):
   - ✅ Already good, just verify all elements

6. **All Buttons**:
   - Standardize to `font-sans font-medium`

---

## 🎯 Design Philosophy

**"Professional but Fun, Sexy but Elegant"**

- **Serif (Playfair)**: Brings romance, elegance, sophistication
  - Use for titles and important moments
  - Makes things feel special and timeless
  
- **Sans-serif (Lato)**: Brings clarity, professionalism, modernity
  - Use for content and actions
  - Makes things readable and approachable
  
- **Weight Hierarchy**: Light → Regular → Medium → Semibold → Bold
  - Light: Soft, airy, sophisticated (use sparingly)
  - Regular: Default body, comfortable reading
  - Medium: Actionable, friendly emphasis (buttons)
  - Semibold: Strong emphasis, labels
  - Bold: Authority, section headers

**The Balance**: 
- Playfair headers = 💋 **Sexy & Elegant**
- Lato body = 💼 **Professional & Fun**
- Proper weight contrast = ✨ **Just the Right Amount of Flair**

---

## ✅ Implementation Checklist

- [ ] Fix Gifts page title ("Your Presence is Our Present")
- [ ] Fix Confirmation page title ("Thank You")
- [ ] Fix Gallery page main title ("Wedding Memories")
- [ ] Fix Gallery page Spotify section header ("The Soundtrack to Our Story")
- [ ] Standardize all buttons to font-medium
- [ ] Add explicit font-sans to FAQ questions
- [ ] Audit all section headings for font-serif font-bold
- [ ] Final visual review of all pages

---

## 🎨 Quick Reference Guide

\`\`\`tsx
// Hero/Page Titles
className="font-serif font-semibold"  // Pia & Ryan style

// Section Headings
className="font-serif font-bold"  // When, Where, Wedding Party

// Body Text
className=""  // Default (Lato regular)
// OR explicit:
className="font-sans"

// Buttons
className="font-sans font-medium"

// Form Labels
className="font-sans font-semibold"

// Inline Strong Text
<strong className="font-semibold">Important!</strong>

// Italic Emphasis
<em>subtle emphasis</em>  // Uses current font
\`\`\`
