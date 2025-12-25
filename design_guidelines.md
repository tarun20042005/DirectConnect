# DirectConnect Rentals: Design Guidelines

## Design Approach
**Reference-Based Approach** inspired by Airbnb's trustworthy marketplace aesthetic, Zillow's data-rich property displays, and Linear's clean typography. The platform emphasizes South Indian cultural authenticity (Tamil Nadu cities) through sophisticated visual hierarchy and premium color treatment that balances trust with approachability.

## Core Design Principles
1. **Premium Trust**: Deep Navy conveys professionalism and stability
2. **Visual Energy**: Emerald accents create optimism and growth
3. **High Contrast Clarity**: Strong color differentiation ensures readability
4. **Image-First Discovery**: Property photography drives engagement

---

## Color System

**Primary Palette**:
- Deep Navy: `#0A1628` - Headers, primary text, navigation backgrounds
- Navy Mid: `#1E3A5F` - Secondary backgrounds, cards
- Navy Light: `#2D4A6F` - Hover states, borders

**Accent Palette**:
- Emerald Primary: `#10B981` - CTAs, success states, active elements
- Emerald Dark: `#059669` - CTA hover states
- Emerald Light: `#34D399` - Highlights, badges

**Neutral Palette**:
- Slate 900: `#0F172A` - Body text
- Slate 700: `#334155` - Secondary text
- Slate 500: `#64748B` - Metadata, labels
- Slate 300: `#CBD5E1` - Borders, dividers
- Slate 100: `#F1F5F9` - Backgrounds, cards
- Slate 50: `#F8FAFC` - Page backgrounds
- White: `#FFFFFF` - Primary backgrounds

**Semantic Colors**:
- Error: `#EF4444`
- Warning: `#F59E0B`
- Info: `#3B82F6`

**Application**:
- Primary buttons: Emerald background, white text
- Secondary buttons: White background, Navy border and text
- Navigation: Deep Navy background, white text
- Property cards: White background, Slate borders
- Price tags: Emerald background, white text
- Verified badges: Emerald with white checkmark
- Links: Emerald text with Navy hover

---

## Typography System

**Font Stack**: Inter (Google Fonts)

**Hierarchy**:
- Hero Headlines: `text-5xl md:text-6xl lg:text-7xl font-bold` (Navy)
- Section Headers: `text-3xl md:text-4xl font-semibold` (Navy)
- Property Titles: `text-xl md:text-2xl font-semibold` (Slate 900)
- Body Text: `text-base font-normal` (Slate 700)
- Metadata: `text-sm font-medium` (Slate 500)
- Captions: `text-xs` (Slate 500)

---

## Layout System

**Spacing Scale**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

**Section Padding**: `py-16 md:py-24 lg:py-32`

**Container Widths**:
- Content: `max-w-7xl mx-auto px-4 md:px-6 lg:px-8`
- Forms: `max-w-2xl`
- Property Details: `max-w-6xl`

**Grids**:
- Property Listings: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
- Features: `grid-cols-1 md:grid-cols-3 gap-8`

---

## Component Library

### Navigation
**Header**: Sticky navigation, Deep Navy background, white text
- Height: `h-20`
- Logo (white) + Search (center, desktop) + "List Property" (Emerald button) + User menu
- Shadow: `shadow-lg` with Navy tint
- Mobile: Hamburger menu, full-screen overlay

### Homepage

**Hero Section** (`min-h-[600px] md:min-h-[700px]`):
- Full-width background image with 50% dark overlay
- Centered content with white text
- Search card: White background, rounded-2xl, shadow-2xl with backdrop blur
- Search includes: Location autocomplete, Date picker, Property type, Emerald search button
- Below search: Trust indicators (white text) - "10,000+ Verified Properties" | "Direct Owner Contact" | "No Hidden Fees"

**How It Works** (Slate 50 background):
- 3-column grid with Heroicons (Emerald)
- Cards: White background, shadow, rounded-xl
- Each card: Icon (Emerald circle background) + Title (Navy) + Description (Slate 700)

**Featured Properties**:
- Horizontal scroll on mobile, grid on desktop
- Cards: White, rounded-xl, shadow-md
- Image (16:9) with Emerald price badge (top-right)
- Verification badge (Emerald checkmark icon)
- Property details in Slate 700
- Heart icon (outline, Emerald on hover)

**Trust Indicators Section**:
- 4-column stats grid (centered)
- Large numbers (Navy, bold) + labels (Slate 600)
- Example: "50K+ Happy Tenants" | "5,000+ Verified Owners"

**Categories** (Navy background):
- White text section
- Grid of property type cards with images
- Each card: Image overlay with white text, Emerald border on hover

### Search Results

**Layout**: Split-screen
- Left: Property cards (scrollable)
- Right: Map view (Leaflet with Emerald markers)

**Property Cards**:
- Image gallery with dots (Emerald active dot)
- Emerald price tag (rounded badge)
- Verification badge
- Navy property title
- Slate metadata (beds, baths, sqft)
- Heart save button (Emerald fill when saved)

**Filter Panel**:
- White background sidebar
- Emerald checkboxes and radio buttons
- Navy text labels
- Emerald slider handles
- "Apply Filters" Emerald button (sticky bottom)

### Property Detail

**Image Gallery**:
- Hero image with 5-image grid overlay
- "View All Photos" Emerald button with blur background
- Full-screen lightbox with Navy navigation

**Layout**: 2-column desktop
- Left (65%): Title (Navy) + Verification (Emerald) + Price (Emerald, large) + Description + Amenities grid (Emerald icons) + Reviews
- Right (35%): Sticky card with white background, shadow-xl
  - Owner profile (avatar + name + verified badge)
  - "Contact Owner" (Emerald button)
  - "Schedule Viewing" (White button, Navy border)
  - Share/Save icons

### Chat Interface

**Modal**: Slide-in from right
- Header: Deep Navy background, white text
- Property context card at top (Emerald accent border)
- Messages: White bubbles (received), Emerald bubbles (sent)
- Input: White with Slate border, Emerald send button
- Typing indicator: Emerald dots animation

### Forms

**All Inputs**:
- Labels: Navy text, font-medium
- Fields: White background, Slate 300 border, Navy text
- Focus: Emerald ring-2
- Placeholders: Slate 400
- Error states: Red border, red helper text

### Footer

**Background**: Deep Navy
**Layout**: 4-column grid (desktop), stacked (mobile)
- White text, Slate 400 links
- Links hover: Emerald
- Newsletter input: White with Emerald submit button
- Social icons: White, Emerald on hover
- Bottom bar: Copyright, Legal links (Slate 500)

---

## Images

**Hero Background**: Modern South Indian cityscape (Bangalore/Chennai skyline) at dusk with contemporary high-rises reflecting golden hour light. Subtle cultural elements like traditional architecture silhouettes in background. Apply 50% dark overlay for text contrast. Image should convey urban sophistication meeting cultural heritage.

**Property Images**: High-quality 16:9 photos, minimum 1200px width. Professional interior/exterior shots with natural lighting.

**Feature Section**: Use photography of actual properties/neighborhoods rather than illustrations. Show diversity of housing types.

**Icons**: Heroicons throughout - home, chat-bubble-left-right, calendar-days, shield-check, star, map-pin, check-circle

**Category Cards**: Real property photos with subtle overlays

---

## Interaction Patterns

**Buttons**:
- Primary (Emerald): `rounded-lg px-6 py-3` with subtle hover brightness increase
- Secondary (Outline): Navy border and text, Emerald fill on hover
- Buttons on images: Blur background (`backdrop-blur-md`) with semi-transparent white/Navy

**Cards**: Subtle lift on hover (`hover:shadow-xl hover:-translate-y-1 transition-transform duration-200`)

**Links**: Emerald text, Navy on hover

**Form Focus**: Emerald ring with increased border weight

**Loading States**: Emerald spinner/skeleton screens

**No Complex Animations**: Only subtle transitions for state changes

---

## Accessibility

- Color contrast: 4.5:1 minimum (Navy on white, Emerald on Navy passes WCAG AA)
- Focus indicators: Emerald ring-2 visible on all interactive elements
- Touch targets: Minimum 44x44px
- Form labels always visible above inputs
- Alt text for all images
- Keyboard navigation throughout