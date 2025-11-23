# DirectConnect Rentals - Setup & Running Instructions

## 🚀 **Running on Replit (Current Environment)**

Your app is **ALREADY RUNNING** on Replit! Visit the app URL that appears in the browser preview.

### What's Working:
- ✅ Backend server on port 5000
- ✅ PostgreSQL database connected
- ✅ All property listings saved to database
- ✅ User authentication with JWT
- ✅ OTP phone verification system
- ✅ Real-time chat with WebSocket

---

## 💻 **Running Locally in VS Code**

### **Prerequisites**
Install these first:
1. **Node.js** (v18+) - Download from [nodejs.org](https://nodejs.org)
2. **PostgreSQL** (v12+) - Download from [postgresql.org](https://www.postgresql.org/download/)
3. **Git** - Download from [git-scm.com](https://git-scm.com)
4. **VS Code** - Download from [code.visualstudio.com](https://code.visualstudio.com)

### **Step 1: Clone the Project**
```bash
git clone <your-repo-url>
cd directconnect-rentals
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Set Up Database**

#### Option A: Using Local PostgreSQL
```bash
# Create a new PostgreSQL database
createdb directconnect_rentals

# Set environment variable
export DATABASE_URL="postgresql://username:password@localhost:5432/directconnect_rentals"
```

#### Option B: Using Neon (Cloud PostgreSQL - Recommended)
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string
4. Add to `.env.local`:
```
DATABASE_URL=postgresql://user:password@neon.tech/directconnect_rentals
```

### **Step 4: Run Database Migrations**
```bash
npm run db:push
```

### **Step 5: Start the Development Server**
```bash
npm run dev
```

The app will open at: **http://localhost:5000**

---

## 📁 **Project Structure**

```
directconnect-rentals/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── pages/         # Route pages (Home, Dashboard, ListProperty, etc)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities (auth, api, phone formatting)
│   │   └── App.tsx        # Main app & routes
│   └── index.html
│
├── server/                 # Backend (Express)
│   ├── routes.ts          # API endpoints
│   ├── storage-db.ts      # Database operations
│   ├── db.ts              # Database connection
│   └── index-dev.ts       # Development server
│
├── shared/
│   └── schema.ts          # Database schema & types
│
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite build config
└── drizzle.config.ts      # Database config
```

---

## 🔧 **Available Commands**

```bash
# Start dev server (frontend + backend)
npm run dev

# Push database schema changes
npm run db:push

# Force push schema (if there are conflicts)
npm run db:push --force

# Generate database types from schema
npm run db:generate

# Build for production
npm run build
```

---

## 🎯 **Key Features to Test**

### 1. **Sign Up**
- Go to home page, click "Sign Up"
- Fill in: Name, email, password (must have uppercase, lowercase, special char)
- Enter Indian phone (+91 format, e.g., +91 98765 43210)
- Choose role: Owner or Tenant

### 2. **List Property** (Owner Only)
- Log in as Owner
- Click "List Property" in dashboard
- Fill 4-step form:
  - Step 1: Title, description, price
  - Step 2: Address, city, coordinates (click map to select)
  - Step 3: Upload images, select amenities
  - Step 4: Review & publish
- Property saved to database ✅

### 3. **Browse Properties** (Tenant)
- Go to "Search"
- View all properties with images
- Click property to see details
- Message owner via chat

### 4. **Phone Verification** (OTP)
- Go to your profile
- Click "Verify Phone Number"
- Enter your phone
- Receive OTP code (check console/logs in dev)
- Enter OTP to verify account

---

## 🗄️ **Database Schema**

Your PostgreSQL database has these tables:

- **users** - User accounts, authentication
- **properties** - Property listings with images, price, location
- **chats** - Conversation threads
- **messages** - Individual chat messages
- **appointments** - Viewing schedules
- **reviews** - Property ratings
- **saved_properties** - Bookmarked properties
- **otp_codes** - Phone verification codes
- **payments** - Payment transactions

All data persists across server restarts in the database.

---

## 🔐 **Environment Variables**

Create a `.env.local` file in the root:

```env
# Database (Replit automatically provides this)
DATABASE_URL=postgresql://user:password@host:5432/db

# Session secret
SESSION_SECRET=your-random-secret-key-here

# JWT secret (optional, uses default if not set)
JWT_SECRET=your-jwt-secret-key
```

---

## 🐛 **Troubleshooting**

### App won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Database connection error
```bash
# Test your DATABASE_URL
psql $DATABASE_URL -c "SELECT 1"

# If it fails, update the connection string
```

### Port already in use
```bash
# Kill process using port 5000
# On Mac/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Property images not showing
- Make sure images are uploaded as base64 strings
- Images stored as JSON array in database

---

## 📱 **Mobile Responsive**

The app works on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

Test on mobile: Press `F12` → Click device icon in DevTools

---

## 🚀 **Deployment (Next Steps)**

Once ready to go live:

1. **Deploy Backend** to Render, Railway, or Heroku
2. **Deploy Frontend** to Vercel, Netlify, or GitHub Pages
3. **Use Production Database** (Neon, AWS RDS, etc)
4. **Set up Custom Domain** (optional)

For now, test everything locally and on Replit!

---

## 📞 **Support Files**

- **API Docs**: See `server/routes.ts` for all endpoints
- **Component Library**: Check `client/src/components/ui/`
- **Styling**: `client/src/index.css` (Tailwind CSS)
- **Schema**: `shared/schema.ts` (Database structure)

---

## ✅ **You're All Set!**

Your DirectConnect Rentals app is ready to use. Start with:

```bash
npm run dev
```

Then visit http://localhost:5000 and start listing properties! 🏠
