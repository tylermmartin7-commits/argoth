# Argoth - Structured Debate Platform

A production-ready MVP social platform for structured debates built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- ✅ Public browsing (no login required to read debates and comments)
- ✅ Authentication required for creating debates, commenting, voting, and reporting
- ✅ Reddit-style hot ranking algorithm for trending debates
- ✅ Multiple feed views: New, Top 24h, Top 7d, Trending
- ✅ Toggle-safe voting system with optimistic UI updates
- ✅ Report functionality for moderation
- ✅ Admin panel for managing reports
- ✅ Row-Level Security (RLS) enforced at database level
- ✅ Fully typed with TypeScript
- ✅ Responsive dark theme UI

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Git

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd argoth
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned (2-3 minutes)
3. Once ready, go to **Project Settings** → **API**
4. Copy your **Project URL** and **anon public** key

### Step 4: Run Database Migrations

1. In your Supabase project, go to the **SQL Editor**
2. Run the SQL scripts in order:
   - First: Copy and run `sql/01_schema.sql`
   - Second: Copy and run `sql/02_rls.sql`
   - Third: Copy and run `sql/03_views_rankings.sql`

3. Verify the tables were created:
   - Go to **Table Editor** and confirm you see: `topics`, `profiles`, `debates`, `comments`, `votes`, `reports`

### Step 5: Configure Environment Variables

1. Copy the example env file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6: Configure Supabase Auth

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add to **Site URL**: `http://localhost:3000`
3. Add to **Redirect URLs**: `http://localhost:3000/**`
4. Go to **Authentication** → **Providers**
5. Ensure **Email** provider is enabled
6. Disable email confirmation for development (optional):
   - Go to **Authentication** → **Email Templates**
   - Toggle off "Enable email confirmations" for testing

### Step 7: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 8: Create Your First Admin User

1. Sign up for an account through the UI
2. In Supabase, go to **Table Editor** → **profiles**
3. Find your profile row and set `is_admin` to `true`
4. Refresh the app - you should now see the Admin link in the navbar

## Supabase Setup Instructions

### Database Schema

The database consists of 6 main tables:

- **topics**: Categories for debates (pre-seeded with 8 topics)
- **profiles**: User profiles linked to Supabase Auth
- **debates**: Debate posts with claims and descriptions
- **comments**: Replies to debates with side affiliations
- **votes**: User votes on debates and comments
- **reports**: Content reports for moderation

### Row-Level Security (RLS)

All tables have RLS enabled with the following permissions:

- **Public**: Can read non-hidden debates, comments, and all votes
- **Authenticated**: Can create debates, comments, votes, and reports
- **Authors**: Can update their own content (but not hide/unhide)
- **Admins**: Can hide/unhide content and manage reports

### Views and Functions

- **Feed Views**: Optimized views for New, Top 24h, Top 7d, and Trending feeds
- **Score Views**: Aggregate vote counts for debates and comments
- **toggle_vote()**: Atomic function for vote toggling logic
- **calculate_hot_score()**: Reddit-style hot ranking algorithm

## Vercel Deployment

### Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase production project

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Set Environment Variables

In Vercel project settings, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Update Supabase Auth URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: `https://your-app.vercel.app/**`

### Step 5: Deploy

Click **Deploy** - your app will be live in ~2 minutes!

## Custom Domain Setup (argoth.io)

### Step 1: Add Domain in Vercel

1. In your Vercel project, go to **Settings** → **Domains**
2. Add `argoth.io` and `www.argoth.io`
3. Vercel will provide DNS records

### Step 2: Configure DNS

1. Go to your domain registrar (e.g., Namecheap, GoDaddy)
2. Add the DNS records provided by Vercel:
   - A record: `@` → `76.76.21.21`
   - CNAME record: `www` → `cname.vercel-dns.com`

### Step 3: Update Supabase

1. In Supabase **Authentication** → **URL Configuration**
2. Update **Site URL** to: `https://argoth.io`
3. Update **Redirect URLs** to: `https://argoth.io/**`

### Step 4: Wait for DNS Propagation

DNS changes can take 1-48 hours. Vercel will automatically issue SSL certificates once DNS is configured.

## Project Structure

```
argoth/
├── sql/                      # Database migration scripts
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── debates/          # Debate pages
│   │   └── admin/            # Admin pages
│   ├── components/           # React components
│   ├── lib/
│   │   ├── actions/          # Server actions
│   │   ├── supabase/         # Supabase clients
│   │   └── types.ts          # TypeScript types
│   └── middleware.ts         # Auth middleware
├── public/                   # Static assets
└── package.json
```

## Key Files

- `sql/01_schema.sql` - Database tables and indexes
- `sql/02_rls.sql` - Row-level security policies
- `sql/03_views_rankings.sql` - Views and ranking functions
- `src/lib/actions/votes.ts` - Vote toggling logic
- `src/components/VoteButtons.tsx` - Optimistic UI for voting
- `src/app/page.tsx` - Home feed with sorting
- `src/app/debates/[id]/page.tsx` - Debate detail page

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=     # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Your Supabase anon/public key
```

## Features in Detail

### Voting System

- **Toggle-safe**: Clicking the same vote removes it, opposite vote switches
- **Atomic**: Uses database function to prevent race conditions
- **Optimistic UI**: Instant feedback while server processes

### Feed Algorithms

- **New**: Simple chronological order
- **Top 24h**: Highest scored in last 24 hours
- **Top 7d**: Highest scored in last 7 days
- **Trending**: Reddit hot algorithm (log score + time decay)

### Security

- RLS enforced on all tables
- Auth required for mutations
- Admins verified at database level
- XSS protection via React

## Development Tips

- Use `npm run dev` for hot reload during development
- Check Supabase logs for database errors
- Use browser DevTools Network tab to debug API calls
- All server actions are in `src/lib/actions/`

## Troubleshooting

**"Invalid API key"**: Check your `.env.local` file has correct Supabase credentials

**"Not authenticated"**: Make sure Supabase Auth URLs are configured correctly

**"RLS policy violation"**: Check that you've run `sql/02_rls.sql`

**Vote not updating**: Clear browser cache and check toggle_vote function exists in database

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
