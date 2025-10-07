# Lumina Hotel Experience

Modern, neon-lit hotel experience that combines a glowing hero animation with API-backed content pages for rooms, amenities, dining, gallery, and bookings.

## Project Overview
- **Static Frontend**: HTML/CSS/JS pages under `personal-website/` with glowing light effects.
- **Backend API**: Fastify + Prisma server under `personal-website/server/` serving rooms, amenities, dining, gallery, testimonials, and bookings.
- **Shared Helpers**: `api-client.js` exposes utilities so each static page fetches from the backend.

## Prerequisites
- Node.js 18+
- npm (comes with Node)
- Docker (for local Postgres) or an accessible PostgreSQL instance

## Backend Setup
1. **Start Postgres (Docker example)**
   ```powershell
   docker run --name lumina-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=lumina -p 5432:5432 -d postgres:16
   ```
2. **Configure environment**
   Copy `server/.env.example` to `server/.env` and adjust values (database URL, JWT secret).
3. **Install & migrate**
   ```powershell
   powershell -ExecutionPolicy Bypass -Command "Set-Location 'c:\Users\korad\CascadeProjects\personal-website\server'; npm install"
   powershell -ExecutionPolicy Bypass -Command "Set-Location 'c:\Users\korad\CascadeProjects\personal-website\server'; npm run prisma:dev"
   powershell -ExecutionPolicy Bypass -Command "Set-Location 'c:\Users\korad\CascadeProjects\personal-website\server'; npm run prisma:seed"
   ```
4. **Run backend**
   ```powershell
   powershell -ExecutionPolicy Bypass -Command "Set-Location 'c:\Users\korad\CascadeProjects\personal-website\server'; npm run dev"
   ```
   Backend listens on `http://localhost:4000`.

## Static Frontend Usage
Because these are static files, run a lightweight web server from the project root (examples below) and open pages at `http://localhost:<port>/...`.

```powershell
# Option A: Python
powershell -ExecutionPolicy Bypass -Command "Set-Location 'c:\Users\korad\CascadeProjects\personal-website'; python -m http.server 8080"

# Option B: npx http-server
powershell -ExecutionPolicy Bypass -Command "Set-Location 'c:\Users\korad\CascadeProjects\personal-website'; npx http-server -p 8080"
```

## Key Pages
- **Home**: `http://localhost:8080/index.html`
- **Rooms**: `http://localhost:8080/rooms.html`
- **Amenities**: `http://localhost:8080/amenities.html`
- **Dining**: `http://localhost:8080/dining.html`
- **Gallery**: `http://localhost:8080/gallery.html`

These pages call the backend (`http://localhost:4000`) for live data, so keep the Fastify server running.

## Deployment (GitHub Pages)
- Commit all static assets (HTML/CSS/JS) at the repository root.
- Ensure `.nojekyll` exists at the root to disable Jekyll processing.
- Use the provided GitHub Actions workflow at `.github/workflows/deploy.yml` to publish to GitHub Pages. It uploads the repository root as the static site.
- In GitHub repository **Settings → Pages**, choose **Source: GitHub Actions**.
- Push to `main` (or run the workflow manually) and wait for the `deploy-pages` job to succeed. The published URL appears in the workflow summary.

## Script Overview
- `hotel-script.js`: glowing hero animation, room cards, booking form submission.
- `rooms-page.js`: builds suite detail sections and comparison table.
- `amenities-page.js`: renders signature amenities and additional services.
- `dining-page.js`: displays featured venues and dining grid.
- `gallery-page.js`: dynamic filters, gallery grid, and testimonial spotlight.
- `api-client.js`: provides `fetchJson`, `formatCurrency`, and `groupBy` helpers for all pages.

## Development Tips
- Keep backend logs open to watch API access.
- Update Prisma schema and rerun `npm run prisma:dev` when you add tables.
- Customize styling in `hotel-styles.css`, `pages-styles.css`, `photo-styles.css`.

Enjoy exploring Lumina Hotel’s neon-lit experience! ✨
