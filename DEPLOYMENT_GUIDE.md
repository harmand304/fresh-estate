# Deployment Guide

Follow these steps to deploy your application:
1.  **Database**: Neon (neon.tech)
2.  **Backend**: Render (render.com)
3.  **Frontend**: Netlify (netlify.com)

## Prerequisites
- GitHub Account (Push your code to a new repository).
- Neon Account.
- Render Account.
- Netlify Account.
- Backblaze B2 Account (for images).

---

## Part 1: Database (Neon)

1.  **Create Database**
    - Go to [Neon Console](https://console.neon.tech).
    - Create a **New Project**.
    - **Name**: `mood-db`.
    - **Region**: Choose one close to you (e.g., Frankfurt or US East).
    - Click **Create Project**.

2.  **Get Connection String**
    - On the Dashboard, click **Connect**.
    - **IMPORTANT**: Ensure **Connection pooling** toggle is **ON** (Green).
    - Look at the code snippet (e.g., `psql 'postgresql://...'`).
    - **Copy ONLY the URL** inside the quotes.
      - It starts with `postgresql://`.
      - It ends with `sslmode=require`.
      - Do **NOT** copy the `psql` word or the quotes.
    - *Save this URL, you will need it for Render and your local migration.*

---

## Part 2: Backend (Render)

1.  **Create Service**
    - Go to [Render Dashboard](https://dashboard.render.com).
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository.
    - **Name**: `mood-api`.
    - **Runtime**: `Node`.
    - **Build Command**: `npm install`.
    - **Start Command**: `npm run server`.

2.  **Environment Variables**
    - Scroll down to "Environment Variables" and click **Add Environment Variable**. Add these:
    
    | Key | Value |
    | :--- | :--- |
    | `DATABASE_URL` | (Paste your **Neon Connection String** from Part 1) |
    | `NODE_ENV` | `production` |
    | `JWT_SECRET` | (Create a random secret like `mysecretkey999`) |
    | `CORS_ORIGIN` | `*` (Or your Netlify URL later) |
    | `B2_KEY_ID` | (Your Backblaze Key ID) |
    | `B2_APPLICATION_KEY` | (Your Backblaze App Key) |
    | `B2_BUCKET_NAME` | (Your Bucket Name) |
    | `B2_REGION` | (Your B2 Region, e.g. `us-east-005`) |
    | `B2_ENDPOINT` | (Your B2 Endpoint, e.g. `s3.us-east-005.backblazeb2.com`) |

3.  **Deploy**
    - Click **Create Web Service**.
    - Wait for it to deploy. Copy your **Backend URL** (e.g., `https://mood-api.onrender.com`).

---

## Part 3: Setup Data (Migration & Seed)

Now you need to push your tables and fake data to the empty Neon database.

1.  **Open Terminal** in your project folder (VS Code).
2.  Run these commands (Replace the URL with your actual **Neon Connection String**):

    ```bash
    # Windows PowerShell
    $env:DATABASE_URL="postgresql://neondb_owner:..." # Paste your actual Neon URL here
    
    # 1. Create Tables
    npx prisma migrate deploy

    # 2. Add Fake Data
    npx prisma db seed
    ```

---

## Part 4: Frontend (Netlify)

1.  **Deploy Site**
    - Go to [Netlify](https://app.netlify.com).
    - **New site from Git** -> Select Repo.
    - **Build command**: `npm run build`
    - **Publish directory**: `dist`
2.  **Environment Variables**
    - Add Variable: `VITE_API_URL`
    - Value: (Paste your **Render Backend URL** from Part 2)
    - *Note: Do NOT put a slash `/` at the end.*
3.  **Deploy**.

Done! Your app is live with Neon DB.
