# DirectConnect Rentals

## Overview

DirectConnect Rentals is a broker-free housing platform that directly connects property owners with tenants (students and individuals), eliminating traditional rental agencies and broker fees. The platform features real-time communication, interactive property search with geospatial capabilities, appointment scheduling, and a review system to build trust between parties.

The application is built as a full-stack TypeScript web application using React for the frontend, Express for the backend, and designed to support PostgreSQL (via Drizzle ORM) for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing instead of React Router
- TanStack Query (React Query) for server state management and caching

**UI Component System**
- shadcn/ui component library based on Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with a custom design system
- Design philosophy inspired by Airbnb's trustworthy marketplace aesthetic, emphasizing image-first discovery and clean layouts
- Custom theme system supporting light/dark modes with CSS custom properties
- Typography system using Inter font for clean, professional text rendering

**State Management**
- React Query handles all server state, API requests, and caching
- Local state managed through React hooks (useState, useContext)
- Authentication state persisted in localStorage and accessed via utility functions
- Theme preferences stored in localStorage

**Key Features Implementation**
- Interactive map integration using Leaflet.js for geospatial property visualization
- Real-time chat functionality using WebSocket connections
- Form validation using React Hook Form with Zod schema validation
- Responsive design with mobile-first approach using Tailwind breakpoints

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server framework
- TypeScript for type safety across the entire backend
- Node.js runtime with ESM module system
- Separate entry points for development (with Vite integration) and production

**API Design**
- RESTful API architecture with JSON request/response format
- JWT (JSON Web Tokens) for stateless authentication
- Bearer token authentication via Authorization headers
- Route handlers organized in a centralized routes file

**WebSocket Integration**
- WebSocket server (ws library) running alongside HTTP server for real-time chat
- WebSocket connections authenticated using JWT tokens
- Message routing between users based on chat rooms/property associations

**Authentication & Security**
- Password hashing using bcryptjs before storage
- JWT-based session management with configurable secret key
- Role-based access control (tenant vs. owner roles)
- Authorization middleware protecting sensitive endpoints
- User verification system for building trust (owner verification)

### Data Storage

**ORM & Database**
- Drizzle ORM for type-safe database queries and schema management
- PostgreSQL as the production database (configured via DATABASE_URL)
- Schema-first approach with TypeScript types generated from Drizzle schema
- Database migrations managed through Drizzle Kit

**Schema Design**

Core entities include:

- **Users**: Authentication, profile information, role-based permissions (tenant/owner)
- **Properties**: Listing details, pricing, location (with geospatial coordinates for map features), images, amenities, virtual tour URLs
- **Chats**: Conversation threads linking tenants and owners for specific properties
- **Messages**: Individual chat messages with timestamps and sender information
- **Appointments**: Viewing schedules with date/time, status tracking (pending/confirmed/cancelled)
- **Reviews**: Property ratings and feedback from tenants
- **SavedProperties**: Tenant-specific bookmarks/favorites

**Geospatial Features**
- Properties store latitude/longitude as decimal coordinates
- Supports map-based property visualization
- Foundation for proximity search and polygon boundary filtering (implemented via database queries)

**Development Fallback**
- In-memory storage implementation (MemStorage class) for development/testing without database
- Matches production interface for seamless switching

### External Dependencies

**Third-Party Services**

- **Neon Database**: Serverless PostgreSQL hosting via @neondatabase/serverless driver
- **Leaflet/OpenStreetMap**: Interactive map rendering and tile services
- **Google Fonts CDN**: Inter font family delivery
- **Cloudinary or AWS S3** (planned): Image storage and optimization for property photos

**Frontend Libraries**

- **Radix UI**: Complete set of accessible component primitives (dialogs, dropdowns, popovers, etc.)
- **TanStack Query**: Powerful async state management for API calls
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Runtime schema validation for forms and API responses
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority (CVA)**: Type-safe variant styling for components
- **Lucide React**: Icon library for consistent iconography

**Backend Libraries**

- **bcryptjs**: Password hashing and verification
- **jsonwebtoken**: JWT creation and validation
- **ws**: WebSocket server implementation
- **drizzle-orm**: Database ORM and query builder
- **drizzle-zod**: Schema-to-Zod validator generation

**Development Tools**

- **TypeScript**: Static type checking across the entire codebase
- **Vite**: Fast development server with HMR and optimized production builds
- **ESBuild**: Fast JavaScript/TypeScript bundler for backend production builds
- **tsx**: TypeScript execution for development server
- **Prettier & ESLint** (recommended): Code formatting and linting

**Deployment Strategy**

- Frontend: Built as static assets, deployable to Vercel, Netlify, or similar CDN platforms
- Backend: Node.js server deployable to Render, AWS EC2, or containerized environments
- Database: Neon serverless PostgreSQL or traditional PostgreSQL instances
- Environment-based configuration via process.env for secrets and URLs