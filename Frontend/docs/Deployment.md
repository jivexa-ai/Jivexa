# JIVEXA Deployment & Build Guide

## 1. Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- MongoDB Connection URI (MongoDB Atlas or Local MongoDB)

## 2. Environment Variables

### Backend (`backend/.env`):
```env
PORT=4000
NODE_ENV=production
MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/jivexa_health_db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### Frontend (`Frontend/.env`):
```env
VITE_BACKEND_URL=https://jivexa-main.onrender.com
VITE_API_URL=https://jivexa-main.onrender.com
VITE_API_BASE_URL=https://jivexa-main.onrender.com
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

## 3. Local Development

### Start Backend:
```bash
cd backend
npm install
npm run dev
```

### Start Frontend:
```bash
cd Frontend
npm install
npm run dev
```

## 4. Production Build Verification
```bash
cd Frontend
npm run build
npm run preview
```

## 5. Deployment Targets
- **Frontend (Vercel / Netlify / Render)**: Connect GitHub repository, set `VITE_BACKEND_URL`, build command `npm run build`, output directory `dist`.
- **Backend (Render / Railway / VPS / AWS)**: Deploy `backend/` as Node.js web service with `start` command `node src/server.js`.
