# DirectConnect Rentals: Design Guidelines

## Design Approach
**Reference-Based Approach** inspired by Airbnb's trustworthy marketplace aesthetic, Zillow's data-rich property displays, and Linear's clean typography. This platform requires visual appeal to build trust while maintaining functional clarity for property search and communication.

## Core Design Principles
1. **Trust Through Clarity**: Clean layouts with ample whitespace convey professionalism
2. **Image-First Discovery**: Property photos drive engagement and decision-making
3. **Efficient Information Density**: Balance visual appeal with data-rich property details
4. **Seamless Transitions**: Smooth navigation between search, listings, and communication

---

## Typography System

**Primary Font**: Inter (via Google Fonts CDN)
- Hero Headlines: `text-4xl md:text-5xl lg:text-6xl font-bold`
- Section Headers: `text-3xl md:text-4xl font-semibold`
- Property Titles: `text-xl md:text-2xl font-semibold`
- Body Text: `text-base font-normal`
- Metadata/Labels: `text-sm font-medium`
- Captions: `text-xs`

**Secondary Font**: System UI stack for interface elements
- Use for buttons, form labels, navigation

---

## Layout System

**Spacing Scale**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: `p-4` to `p-8`
- Section spacing: `py-12 md:py-20 lg:py-24`
- Grid gaps: `gap-4` to `gap-8`
- Form field spacing: `space-y-4`

**Container Widths**:
- Full-width: Map views, hero sections
- Content: `max-w-7xl mx-auto px-4 md:px-6`
- Forms/Modals: `max-w-2xl`
- Property details: `max-w-6xl`

**Grid Systems**:
- Property listings: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Feature cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Split layouts: `grid-cols-1 lg:grid-cols-2`

---

## Component Library

### Navigation
**Header**: Sticky top navigation with logo left, search center (desktop), auth/profile right
- Height: `h-16 md:h-20`
- Include: Logo, search bar (collapsible on mobile), "List Property" CTA, user menu

### Homepage
**Hero Section**: 
- Full-width background image (modern apartment/cityscape) with overlay
- Height: `min-h-[500px] md:min-h-[600px]`
- Centered search box with prominent shadow and backdrop blur
- Headline + subheading above search
- Search includes: Location autocomplete, Move-in date, Property type dropdown, Search button

**How It Works**: 3-column grid showcasing platform benefits
- Icons from Heroicons (home, chat, calendar)
- Title + description per card
- `bg-gray-50` background section

**Featured Properties**: Horizontal scrollable card carousel
- 4-6 properties visible on desktop
- Card: Image (16:9 ratio), price badge, location, bedrooms/baths, quick details

### Search Results Page
**Layout**: Split-screen design
- Left: Scrollable property cards (40% width on desktop, full on mobile)
- Right: Interactive map (60% width on desktop, toggle view on mobile)

**Property Cards**:
- Image gallery preview with dots indicator
- Verified badge for verified owners
- Price (prominent), location, property type
- Key metrics: bedrooms, bathrooms, sqft
- Save/favorite button (heart icon)
- Rating stars if available

**Map View**:
- Leaflet.js integration
- Property markers cluster at zoom out
- Custom marker icons showing price
- Polygon drawing tool in top-right
- Zoom/search controls

**Filter Panel**: 
- Collapsible sidebar (desktop) or bottom sheet (mobile)
- Filters: Price range (slider), property type (checkboxes), bedrooms, bathrooms, amenities (multi-select), verified owners only
- "Apply Filters" sticky button

### Property Detail Page
**Image Gallery**: 
- Hero: Large image with gallery grid (show 4-5 images in grid overlay)
- Click to open full-screen lightbox carousel
- "Virtual Tour" button overlay if available

**Content Layout**: 2-column on desktop
- **Left Column (60%)**:
  - Property title + verification badge
  - Price (monthly) + deposit info
  - Location with map thumbnail
  - Description (expandable)
  - Amenities grid (icons + labels)
  - Reviews section with rating breakdown
  
- **Right Column (40%)**:
  - Sticky booking card with owner profile
  - "Contact Owner" button (opens chat)
  - "Schedule Viewing" button (opens calendar modal)
  - Property stats: Posted date, views
  - Share/Save buttons

### Chat Interface
**Chat Modal**: Slide-in panel from right (desktop) or full-screen (mobile)
- Message list with sender avatars
- Input box with send button at bottom
- Property context card at top (image thumbnail, title, price)
- Real-time typing indicators
- Message timestamps

### Viewing Scheduler
**Calendar Modal**:
- Month view calendar with available dates highlighted
- Time slot selection (30-min intervals)
- Owner's available times shown
- Confirmation message input
- Request viewing button

### User Dashboard
**Owner Dashboard**:
- Stats cards: Total listings, active inquiries, scheduled viewings, total views
- Quick actions: "Add New Listing", "View Messages"
- Listings table with edit/delete/view actions

**Tenant Dashboard**:
- Saved properties grid
- Scheduled viewings list with status
- Recent searches
- Message threads

### Listing Creation Form
**Multi-step Wizard**:
- Progress indicator at top
- Steps: Property details → Location → Images → Amenities → Pricing → Review
- Image upload zone with drag-and-drop, multiple file support
- Location autocomplete with map picker
- Amenity checkboxes with icons
- Preview before publish

### Authentication
**Login/Signup Modal**:
- Centered modal with backdrop blur
- Tabs for Login/Signup
- OAuth buttons (Google) with icons
- Email/password fields
- Role selection: "I'm a Tenant" / "I'm an Owner" toggle

### Footer
**Multi-column Layout**:
- Company info + logo
- Links: About, How it Works, List Property, Contact
- Legal: Terms, Privacy, Trust & Safety
- Social media icons
- Newsletter signup input

---

## Images

**Hero Background**: Modern, welcoming apartment interior or city skyline at sunset/golden hour. Should convey opportunity and new beginnings. Overlay with dark gradient (opacity 40-50%) for text readability.

**Property Listings**: High-quality interior/exterior shots. Recommend 16:9 aspect ratio, minimum 1200px width. Show living spaces, kitchens, bedrooms.

**Feature Icons**: Use Heroicons for consistency - house, chat-bubble, calendar, shield-check, star, map-pin

**Placeholder Images**: For properties without photos, use subtle geometric patterns or property-type illustrations

---

## Interaction Patterns

**Property Cards**: 
- Subtle lift on hover (`hover:shadow-lg transform hover:-translate-y-1 transition-all`)
- Image gallery dots change on hover without page navigation

**Buttons**:
- Primary CTA: Large, rounded corners (`rounded-lg`), prominent
- Secondary: Outline style with hover fill
- Icon buttons: Circular with subtle background

**Search**: 
- Autocomplete dropdown appears below input
- Recent searches shown when empty
- Clear button (X icon) when text entered

**Map Interactions**:
- Click marker to show property preview card
- Draw polygon tool activates on button click
- Zoom to bounds when search applied

**No Animations**: Minimize distracting motion. Use only subtle transitions (transform, opacity) for state changes. No scroll-triggered animations, parallax, or complex keyframe animations.

---

## Accessibility & Form Standards

- All form inputs include visible labels above fields
- Focus states with clear outlines (`focus:ring-2`)
- Minimum touch target: 44x44px for mobile
- Color contrast minimum 4.5:1 for text
- Alt text for all property images
- Keyboard navigation support for all interactive elements
- ARIA labels for icon-only buttons