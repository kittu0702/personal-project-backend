# Lumina Admin Portal

Standalone static admin interface for viewing Lumina Hotel bookings.

## Prerequisites
- Fastify backend running at `http://localhost:4000` (see `server/` instructions).
- Admin credentials (default seed):
  - Email: `admin@lumina.com`
  - Password: `Admin@123`

## Run the Admin Portal
```powershell
powershell -ExecutionPolicy Bypass -Command "Set-Location 'c:\Users\korad\CascadeProjects\personal-website\admin-portal'; python -m http.server 9000"
```
Then open `http://localhost:9000/` in a browser.

_Alternatively_: use any static file server (`npx http-server`, VS Code Live Server, etc.).

## Usage
1. Sign in with admin email/password.
2. Dashboard automatically fetches bookings from `/api/v1/admin/bookings` using the stored JWT token.
3. Use filters to narrow by booking status, payment status, or guest email.
4. Click **Sign Out** to clear the session.

Tokens are stored in `localStorage` under `lumina_admin_token`; they are cleared on logout or when invalid.
