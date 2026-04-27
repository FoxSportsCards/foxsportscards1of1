# Supabase setup

1. Create a Supabase project.
2. In `Authentication > URL Configuration`, set the site URL to `https://foxsportscards1of1.com`.
3. Add redirect URLs:
   - `https://foxsportscards1of1.com/cuenta`
   - `http://localhost:3000/cuenta`
4. Run every file in `supabase/migrations` in order from the Supabase SQL editor.
5. Add these variables in `.env.local` and Cloudflare Pages:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, server only)
   - `ADMIN_EMAILS` (comma-separated admin emails)
   - `SANITY_WRITE_TOKEN` (optional, needed to sync stock changes back to Sanity)
6. Optional Google login: enable Google in `Authentication > Providers` and add the Google OAuth credentials there.

To enable admin access through the database instead of `ADMIN_EMAILS`, add an admin row:

```sql
insert into public.admin_users (email)
values ('admin@example.com')
on conflict (email) do nothing;
```

Sanity remains the product CMS. Supabase stores customer accounts, delivery profiles, order history, operational inventory, and admin order state.

## Telegram bot

1. Create a bot with BotFather and save the token as `TELEGRAM_BOT_TOKEN`.
2. Send a message to the bot, get your chat id, and save it as `TELEGRAM_ADMIN_CHAT_ID`.
3. Set a random secret as `TELEGRAM_WEBHOOK_SECRET`.
4. Register the webhook:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://foxsportscards1of1.com/api/telegram/webhook" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

New web orders notify Telegram. Confirm/reject buttons update Supabase and the admin dashboard.
