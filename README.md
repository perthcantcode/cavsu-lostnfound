# CavSU Lost & Found — Full Stack Web App

A complete Lost & Found system for Cavite State University built with React, Node.js, and MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (free cloud) |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io |
| Maps | Leaflet.js + React-Leaflet |
| Image upload | Multer + Cloudinary |
| Frontend hosting | Vercel |
| Backend hosting | Railway |

---

## Features

- Register/Login with student ID
- Post lost or found items with photos and map pin
- Search and filter items by type, category, keyword
- Real-time chat between finder and owner
- Live location sharing in chat
- Claim submission system
- Admin dashboard (users, items, claims, stats)
- Fully responsive mobile design

---

## Setup Instructions

### Prerequisites
- Node.js v18+ installed
- VS Code installed
- Git installed
- MongoDB Atlas free account → https://mongodb.com/atlas
- Cloudinary free account → https://cloudinary.com

---

### Step 1 — Clone or open project

Open the `cavsu-lostandfound` folder in VS Code.

---

### Step 2 — MongoDB Atlas setup

1. Go to https://mongodb.com/atlas and create a free account
2. Create a free cluster (M0)
3. Under "Database Access" → Add a database user (username + password)
4. Under "Network Access" → Add IP Address → Allow access from anywhere (0.0.0.0/0)
5. Click "Connect" → "Connect your application" → Copy the connection string
6. Replace `<password>` in the string with your database user password

---

### Step 3 — Cloudinary setup

1. Go to https://cloudinary.com and create a free account
2. From the Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

---

### Step 4 — Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret_string_here
FRONTEND_URL=http://localhost:5173
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_KEY=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_api_secret
```

Then install and run:
```bash
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

---

### Step 5 — Frontend setup

Open a NEW terminal in VS Code:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

### Step 6 — Create admin account

1. Register a normal account on the website
2. In MongoDB Atlas, go to Browse Collections → users collection
3. Find your user document
4. Click Edit → change `"role": "user"` to `"role": "admin"`
5. Save

Now log in again and you'll see the Admin panel.

---

## Project Structure

```
cavsu-lostandfound/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Chat.js
│   │   └── Claim.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── items.js
│   │   ├── chat.js
│   │   ├── claims.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env          ← create this from .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── MapPicker.jsx
    │   │   └── items/
    │   │       ├── ItemCard.jsx
    │   │       └── ClaimModal.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ItemsPage.jsx
    │   │   ├── ItemDetailPage.jsx
    │   │   ├── PostItemPage.jsx
    │   │   ├── ChatPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── MyItemsPage.jsx
    │   │   └── AdminPage.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env          ← create this from .env.example
```

---

## Deployment

### Deploy backend to Railway

1. Go to https://railway.app and sign up with GitHub
2. New Project → Deploy from GitHub repo → select your repo
3. Set the root directory to `backend`
4. Add all your `.env` variables in Railway's Variables tab
5. Change `FRONTEND_URL` to your Vercel URL once deployed
6. Railway gives you a public URL like `https://yourapp.railway.app`

### Deploy frontend to Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Import your repo → set root directory to `frontend`
3. Add environment variables:
   - `VITE_API_URL` = `https://yourapp.railway.app/api`
   - `VITE_SOCKET_URL` = `https://yourapp.railway.app`
4. Deploy

---

## VS Code Extensions (recommended)

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier
- Thunder Client (for API testing)
- MongoDB for VS Code

---

## Common Issues

**"Cannot connect to MongoDB"**
→ Make sure your IP is whitelisted in Atlas Network Access

**"Leaflet icon not showing"**
→ The MapPicker component already has the fix built in

**"Socket not connecting"**
→ Make sure VITE_SOCKET_URL matches your backend URL exactly

**Images not uploading**
→ Double check your Cloudinary credentials in .env
