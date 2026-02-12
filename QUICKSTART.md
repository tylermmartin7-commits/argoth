# Argoth - Quick Start Guide

## 🚀 Get Running in 10 Minutes

### 1. Install Dependencies (1 min)
```bash
cd argoth
npm install
```

### 2. Create Supabase Project (2 mins)
- Go to https://supabase.com
- Click "New Project"
- Choose a name, database password, and region
- Wait for project to initialize (~2 mins)

### 3. Run Database Scripts (2 mins)
In Supabase Dashboard → SQL Editor, run these files IN ORDER:
1. `sql/01_schema.sql` ✅ (creates tables)
2. `sql/02_rls.sql` ✅ (sets up security)
3. `sql/03_views_rankings.sql` ✅ (creates feeds)

### 4. Configure Environment (1 min)
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
- Go to Project Settings → API
- Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Configure Auth (1 min)
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`

### 6. Run the App (30 sec)
```bash
npm run dev
```

Open http://localhost:3000 🎉

### 7. Create Admin User (1 min)
1. Sign up through the UI
2. Supabase → Table Editor → profiles
3. Find your row, set `is_admin = true`
4. Refresh app to see Admin panel

## ✅ Verification Checklist

- [ ] `npm install` completed without errors
- [ ] Supabase project created
- [ ] All 3 SQL scripts ran successfully
- [ ] `.env.local` has correct credentials
- [ ] Auth redirect URLs configured
- [ ] App running on http://localhost:3000
- [ ] Can sign up and sign in
- [ ] Can create a debate
- [ ] Can vote on debates
- [ ] Can comment on debates
- [ ] Admin can see reports page

## 🐛 Common Issues

**"Invalid API key"**
→ Double-check `.env.local` credentials from Supabase Project Settings → API

**"Not authenticated"**
→ Make sure redirect URLs are set in Supabase Auth settings

**"RLS policy violation"**
→ Verify you ran `02_rls.sql` successfully

**Votes not working**
→ Check that `toggle_vote` function exists: Supabase → Database → Functions

**Can't see admin panel**
→ Set `is_admin = true` in profiles table for your user

## 📦 Deploy to Vercel (5 mins)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

Full instructions in README.md

## 🎯 Key Features to Test

1. **Public Browsing**: Open incognito, verify you can see debates/comments
2. **Voting**: Click agree/disagree, try clicking same vote to remove
3. **Feed Sorting**: Test New, Top 24h, Top 7d, Trending tabs
4. **Create Debate**: Fill out form with all fields
5. **Comments**: Add comments with different side affiliations
6. **Reports**: Report a debate or comment
7. **Admin**: View reports page, update status, hide content

## 📚 Next Steps

- Read full README.md for detailed documentation
- Explore the database schema in `sql/01_schema.sql`
- Check out the vote toggling logic in `src/lib/actions/votes.ts`
- Customize the design in `src/app/globals.css`
- Deploy to production on Vercel

---

**Need help?** Check the full README.md or create a GitHub issue.
