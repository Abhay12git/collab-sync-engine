# 100% Free Hosting Guide: Render + Vercel + MongoDB Atlas

This guide walks you through deploying **Collab Sync Engine** completely **FREE ($0/month forever)** using Render for the Backend and Vercel for the Frontend.

---

## Deployment Architecture

```
                  ┌─────────────────────────────────────┐
                  │    Vercel (Frontend SPA)            │
                  │    https://collab-sync.vercel.app   │
                  └──────────────────┬──────────────────┘
                                     │
                             HTTPS / WebSockets
                                     │
                  ┌──────────────────▼──────────────────┐
                  │    Render (Node.js Backend)         │
                  │    https://collab-backend.onrender.com
                  └──────────────────┬──────────────────┘
                                     │
                                     │ MongoDB Connection
                  ┌──────────────────▼──────────────────┐
                  │    MongoDB Atlas (Free M0 Cluster)  │
                  └─────────────────────────────────────┘
```

---

## Part 1: Deploy Backend to Render.com (Free)

1. Go to [Render.com](https://render.com) and click **Sign Up** (sign in with your GitHub account).
2. Click **New +** -> Select **Web Service**.
3. Connect your GitHub repository: `Abhay12git/collab-sync-engine`.
4. Configure the Web Service:
   - **Name**: `collab-sync-backend`
   - **Region**: Choose closest to you (e.g. Singapore, Oregon, Frankfurt)
   - **Branch**: `develop` (or `main`)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build --workspace=shared && npm run build --workspace=backend`
   - **Start Command**: `npm start`
   - **Instance Type**: Select **Free** ($0/mo)

5. Add **Environment Variables** (under Environment tab):
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb+srv://abhaykowshik_db_user:f07oiYA2OEuu5LdR@collab-sync.hbqegdl.mongodb.net/collab-sync?retryWrites=true&w=majority&appName=collab-sync`
   - `JWT_SECRET` = `super_secret_jwt_key_collab_sync_2026`
   - `NODE_ENV` = `production`

6. Click **Create Web Service**.
7. Once deployed, copy your Render backend URL (e.g., `https://collab-sync-backend.onrender.com`).

---

## Part 2: Deploy Frontend to Vercel (Free)

1. Go to [Vercel.com](https://vercel.com) and click **Sign Up** (sign in with GitHub).
2. Click **Add New...** -> **Project**.
3. Import your repository: `Abhay12git/collab-sync-engine`.
4. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**!
6. Once deployed, copy your live Vercel URL (e.g., `https://collab-sync-frontend.vercel.app`).

---

## Part 3: Verify Real-Time Collaboration

1. Open your live Vercel URL in your browser.
2. Register an account and log in.
3. Create a new document, copy the URL, and send it to a friend or open it in an Incognito window.
4. Both users can now edit code together in real time for **$0/month forever**!
