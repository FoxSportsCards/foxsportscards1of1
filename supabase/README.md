# Supabase setup

1. Create a Supabase project.
2. In `Authentication > URL Configuration`, set the site URL to `https://foxsportscards1of1.com`.
3. Add redirect URLs:
   - `https://foxsportscards1of1.com/cuenta`
   - `http://localhost:3000/cuenta`
4. Run `supabase/migrations/20260424173000_customer_accounts.sql` in the Supabase SQL editor.
5. Add these variables in `.env.local` and Cloudflare Pages:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Optional Google login: enable Google in `Authentication > Providers` and add the Google OAuth credentials there.

Sanity remains the product CMS. Supabase only stores customer accounts, delivery profiles, and order history.
