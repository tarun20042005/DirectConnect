# DirectConnect Rentals - Local Setup Guide for Windows

## Prerequisites

1. **Node.js LTS (v22)** - Download from https://nodejs.org/
   - During installation, check "Add to PATH"
   - Verify: `node --version` and `npm --version` in PowerShell

2. **Git** - Download from https://git-scm.com/
   - Verify: `git --version`

3. **PostgreSQL Database (Neon)** - https://console.neon.tech/
   - Create a free account
   - Create a new project and database
   - Copy your connection string

## Step 1: Clone the Project

```bash
git clone <your-repo-url>
cd directconnect-rentals
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Environment Variables

1. Copy the example env file:
```bash
copy .env.example .env
```

2. Open `.env` in VS Code and fill in:

```env
# Get this from Neon: https://console.neon.tech/
DATABASE_URL="postgresql://username:password@db.neon.tech/dbname?sslmode=require"

# Generate a random string (any long random string is fine)
SESSION_SECRET="your-very-secure-random-string-here-minimum-32-chars"
```

**How to get DATABASE_URL from Neon:**
- Go to https://console.neon.tech/
- Click on your project
- Under "Connection string" section, select "Node.js"
- Copy the full connection string
- Paste it into `.env` as `DATABASE_URL`

## Step 4: Initialize the Database

Push the schema to Neon:

```bash
npm run db:push
```

This will create all tables (users, properties, appointments, etc.) in your Neon database.

## Step 5: Start the Development Server

```bash
npm run dev
```

You should see:
```
✓ [vite] server hmr configured
4:42:11 PM [express] serving on port 5000
```

## Step 6: Open the App

Open your browser:
```
http://localhost:5000
```

---

## Available Commands

```bash
npm run dev              # Start dev server with hot reload
npm run build           # Build for production
npm start               # Run production server
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Drizzle Studio (visual database editor)
npm run check           # Check TypeScript types
```

---

## Testing the App

### Create Test Accounts:

1. **Sign up as Owner**
   - Email: `owner@example.com`
   - Password: `password123`
   - Phone: `+91 98765 43210`
   - Role: **Owner**

2. **Sign up as Tenant**
   - Email: `tenant@example.com`
   - Password: `password123`
   - Phone: `+91 98765 43211`
   - Role: **Tenant**

### Features to Test:

✅ **List Property** - Log in as Owner, go to Dashboard, click "Add New Listing"  
✅ **Browse Properties** - Log in as Tenant, see properties in "Browse Properties" tab  
✅ **Save Property** - Tenants can click heart icon to save properties  
✅ **Featured Properties** - Latest properties appear on tenant dashboard  
✅ **Chat** - Click property to send message to owner  
✅ **Schedule Appointment** - Tenants can schedule viewings  

---

## Troubleshooting

### Port 5000 Already in Use

**Windows PowerShell:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Database Connection Error

1. Check `.env` - DATABASE_URL should have correct Neon connection string
2. Verify you can access Neon: https://console.neon.tech/
3. Try force push: `npm run db:push --force`

### npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s node_modules
del package-lock.json

# Reinstall
npm install
```

### Seeing Replit Symbols/Branding on localhost?

If you see a Replit dev banner or other Replit UI elements when running on localhost:

1. Make sure your `.env` file does **NOT** contain `REPL_ID`
2. Clear Node environment variables:
```powershell
# In PowerShell, check if REPL_ID is set
$env:REPL_ID

# If it shows a value, remove it
Remove-Item env:REPL_ID
```

3. Stop the dev server (Ctrl+C)
4. Start it again: `npm run dev`

The Replit plugins only load when `REPL_ID` environment variable exists. When running locally, this variable should NOT be set.

### Vite HMR Errors (wss://localhost:undefined)

These are normal development warnings and don't affect functionality. The app will still work.

### TypeScript Errors

```bash
npm run check
```

### Need to Reset Database

```bash
# Dangerous! Deletes all data. Get new connection string from Neon console.
npm run db:push --force
```

---

## Project Structure

```
directconnect-rentals/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/          # All pages
│   │   ├── components/     # Reusable components
│   │   └── App.tsx         # Main app
│   └── index.html
├── server/                  # Express backend
│   ├── app.ts              # Express setup
│   ├── routes.ts           # API routes
│   ├── storage-db.ts       # Database layer
│   ├── index-dev.ts        # Dev entry
│   └── index-prod.ts       # Prod entry
├── shared/                  # Shared code
│   └── schema.ts           # Database schema
├── vite.config.ts          # Vite configuration
├── drizzle.config.ts       # Drizzle configuration
├── tailwind.config.ts      # Tailwind CSS
├── .env                    # Environment variables (create from .env.example)
└── package.json
```

---

## Key Technologies

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, TypeScript, Node.js
- **Database:** PostgreSQL (via Neon), Drizzle ORM
- **Real-time:** WebSocket (ws library)
- **Authentication:** JWT, bcryptjs
- **Styling:** Tailwind CSS + shadcn/ui components

---

## Need Help?

1. Check the logs - server logs show API requests
2. Open browser DevTools (F12) - check console for client-side errors
3. Check database - `npm run db:studio` to view Neon database in browser
4. Check Neon console - ensure database is running

---

## Deploy to Production

When ready to deploy, use:
```bash
npm run build
npm start
```

This builds the React frontend and runs the production server.

---

## Environment Variables for Production

Before deploying, update your hosting provider with:
- `DATABASE_URL` - Your Neon PostgreSQL URL
- `SESSION_SECRET` - A long, random, secure string
- `NODE_ENV` - Set to "production"
- Optional: Stripe keys if using payment integration

---

**Happy coding! 🚀**
