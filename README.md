# KnowYourPew

A spiritual gifts assessment app for Woodridge Baptist Church. It collects participant info, scores the assessment, shows top gifts instantly, emails branded results, and gives admins a searchable export dashboard.

## Stack
- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma 7
- SQLite for local development and simple VPS hosting
- Microsoft Graph API for outbound email

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment values into `.env`.
3. Generate the Prisma client and sync the local database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## Environment variables
- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `MSGRAPH_TENANT_ID`
- `MSGRAPH_CLIENT_ID`
- `MSGRAPH_CLIENT_SECRET`
- `MSGRAPH_SEND_AS`

## Email delivery
The `/api/email-results` route uses Microsoft Graph client credentials flow and sends mail through the mailbox in `MSGRAPH_SEND_AS`.

Required Microsoft Graph permission:
- `Mail.Send` application permission, granted for the configured tenant

## Admin dashboard
- `/admin` is protected by `ADMIN_PASSWORD`
- CSV export now includes every spiritual gift score column, not just the top three gifts

## Deployment notes

### Vercel
A starter `vercel.json` is included. The app will build on Vercel, but SQLite is not a good production fit for serverless.

Use one of these before deploying there:
- Vercel Postgres
- Supabase Postgres
- Turso / libsql

If you move to one of those, update `prisma/schema.prisma` and `DATABASE_URL` to match the new provider.

### VPS fallback
SQLite is still fine for a single VPS deployment. A systemd template is included at `deploy/knowyourpew.service`.

Example deploy flow:
```bash
sudo mkdir -p /opt/knowyourpew
sudo cp -R . /opt/knowyourpew
cd /opt/knowyourpew
npm install
npx prisma generate
npx prisma db push
npm run build
sudo cp deploy/knowyourpew.service /etc/systemd/system/knowyourpew.service
sudo systemctl daemon-reload
sudo systemctl enable --now knowyourpew
```

By default the service runs on port `3300`. Put Nginx or Caddy in front of it for TLS and a friendly domain.

## Build
```bash
npm run build
```
