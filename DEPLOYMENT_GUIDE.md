# Production Deployment Guide

This guide details the step-by-step process of deploying the **MedConnect** platform (Frontend & Backend) to a production environment. 

We will cover two main deployment strategies:
1. **Cloud Platforms (PaaS)**: Using Vercel (Frontend), Render (Backend), and Neon/Supabase (PostgreSQL Database). *Recommended for fast setup and automated deployments.*
2. **Virtual Private Server (VPS)**: Using a cloud VM (DigitalOcean/AWS EC2) with PM2, Nginx, and SSL. *Recommended for cost efficiency and full environment control.*

---

## Architecture Overview

```
                   ┌──────────────┐
                   │   Frontend   │ (Vercel / Netlify / CDN)
                   │ (React+Vite) │
                   └──────┬───────┘
                          │ HTTPS API Requests
                          ▼
                   ┌──────────────┐
                   │   Nginx/SSL  │ (Reverse Proxy, HTTPS Termination)
                   └──────┬───────┘
                          │ HTTP Proxy Pass (e.g., localhost:3000)
                          ▼
                   ┌──────────────┐
                   │   Backend    │ (Express + Prisma client)
                   │   (NodeJS)   │
                   └──────┬───────┘
                          │ PostgreSQL Connection
                          ▼
                   ┌──────────────┐
                   │  PostgreSQL  │ (Database)
                   └──────────────┘
```

---

## Phase 1: Database Setup (Production PostgreSQL)

Do not use your local database in production. Set up a hosted PostgreSQL database:

### Option A: Neon Serverless Postgres (Recommended)
1. Register/Login at [Neon.tech](https://neon.tech/).
2. Create a new project named `medconnect-db`.
3. Select your preferred region (choose the one closest to your backend hosting server).
4. Copy the connection string. It will look like this:
   `postgresql://neondb_owner:password@ep-host.region.pooler.neon.tech/neondb?sslmode=require`

### Option B: Supabase Database
1. Register/Login at [Supabase](https://supabase.com/).
2. Create a new project.
3. Under Project Settings -> Database, copy the **Connection string** (URI mode, Transaction mode/Session mode as needed).

---

## Phase 2: Backend Deployment

### Strategy A: Deploying on Render (PaaS)
1. Create a [Render](https://render.com/) account and connect your GitHub repository.
2. In the Render Dashboard, click **New +** and select **Web Service**.
3. Choose the backend repository folder.
4. Configure the settings:
   - **Name**: `medconnect-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `node src/index.js`
5. Under **Environment Variables**, add:
   - `PORT`: `3000` (or leave empty, Render assigns this dynamically)
   - `DATABASE_URL`: `your_production_postgresql_url`
   - `CORS_ORIGIN`: `https://your-frontend-domain.vercel.app`
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: `your-gmail@gmail.com`
   - `SMTP_PASS`: `your-app-password`
6. Click **Deploy Web Service**. Render will build and deploy the backend. Copy your service URL (e.g. `https://medconnect-backend.onrender.com`).

---

### Strategy B: Deploying on VPS (AWS EC2 / DigitalOcean)
1. **Connect via SSH**: `ssh root@your_server_ip`
2. **Install Node.js, Nginx, and Git**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx git
   ```
3. **Install PM2 globally**:
   ```bash
   sudo npm install -y pm2 -g
   ```
4. **Clone & Set Up the Repository**:
   ```bash
   cd /var/www
   git clone <your-repo-url> medical-website
   cd medical-website/Backend
   npm install --production
   ```
5. **Configure Production `.env`**:
   Create a `.env` file containing your production `DATABASE_URL`, `SMTP_*`, and `CORS_ORIGIN` variables.
6. **Deploy database & client code**:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
7. **Start Backend with PM2**:
   ```bash
   pm2 start src/index.js --name "medconnect-backend"
   pm2 save
   pm2 startup
   ```
8. **Configure Nginx as a Reverse Proxy**:
   Create configuration: `sudo nano /etc/nginx/sites-available/medconnect`
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Enable it: `sudo ln -s /etc/nginx/sites-available/medconnect /etc/nginx/sites-enabled/` and restart: `sudo systemctl restart nginx`
9. **Configure SSL**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## Phase 3: Frontend Deployment (React + Vite)

Before deploying the frontend, ensure your code dynamically points to the production backend API URL instead of `http://localhost:3000`.

### Step 1: Configure Environment Variables in Vite
In the React frontend directory `MedConnect12`:
1. Check if an API helper (like `axios` instance) is using an environment variable, e.g.:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
   ```
2. Create/Update the `.env` production file for your host:
   ```env
   VITE_API_URL=https://medconnect-backend.onrender.com/api
   ```
   *(Replace with your actual backend URL. Note: Vite env variables must start with `VITE_`)*.

---

### Step 2: Deploy Frontend on Vercel
1. Register/Login at [Vercel](https://vercel.com/) and connect your GitHub account.
2. Select **Add New** -> **Project**.
3. Select your repository.
4. Configure settings:
   - **Root Directory**: Select `MedConnect12` (the frontend folder) if it's in a monorepo.
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-deployed-backend-url.com/api`
6. Click **Deploy**. Vercel will build and serve your static React application globally.

---

## Phase 4: Verification Checklist

1. **CORS Configuration**: Verify the backend `CORS_ORIGIN` exactly matches your frontend domain (e.g. `https://medconnect-app.vercel.app`).
2. **Prisma Client Generated**: Ensure `npx prisma generate` was executed during the backend build.
3. **Database Migrations Executed**: Ensure `npx prisma migrate deploy` has run on the production database.
4. **HTTPS Encryption**: Ensure both frontend and backend are communicating over `https://` (browsers block mixed content HTTP/HTTPS).
