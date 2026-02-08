# SafeFall AI

Fall Detection, Emergency Response & Patient Monitoring System – healthcare-grade, secure, mobile-first MERN application.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Socket.io client, Chart.js, Leaflet
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Socket.io, Nodemailer

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Environment Setup

1. Copy `server/.env.example` to `server/.env`
2. Set `MONGODB_URI` (MongoDB Atlas connection string or `mongodb://127.0.0.1:27017/safefall` for local)
3. Set `JWT_SECRET` (random string for JWT signing)

### 3. Run Development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**Development mode** (when `NODE_ENV` is not `production`):
- **Demo seed**: On first run with empty DB, creates demo patient (`demo@safefall.ai` / `demo123`) and hospital (`hospital@safefall.ai` / `hospital123`) with realistic data
- **Simulator**: Continuously generates sensor readings, notifications, fall events, and occasional emergencies
- **New patients**: Automatically receive seeded data on registration

## MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create cluster → Connect → Get connection string
3. Replace `<password>` with your DB user password
4. Add `CLIENT_URL` for your frontend origin in Network Access

## Deployment

### Backend (Render)

1. Create Web Service
2. Connect GitHub repo
3. Build: `cd server && npm install`
4. Start: `cd server && npm start`
5. Add environment variables (MONGODB_URI, JWT_SECRET, CLIENT_URL)
6. Set CLIENT_URL to Vercel URL

### Frontend (Vercel)

1. Import project, set **Root Directory** to `.` (project root)
2. Build: `cd client && npm install && npm run build`
3. Output: `client/dist`
4. Add env: `VITE_API_URL` = `https://your-app.onrender.com` (Render backend URL)
5. Add env (optional): `VITE_GOOGLE_CLIENT_ID` for Google sign-in

## Roles

- **Patient:** Dashboard, fall simulation, emergency flow, contacts, health profile, fall history, live map, analytics chat
- **Hospital:** Active emergencies only, acknowledge, resolve, live map of patients

## Security

- bcrypt password hashing
- JWT authentication
- Role-based routes
- Row-level security: patients access own data; hospitals access only during emergencies or assignment
- Access logging
