import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { runSeed } from './services/seedDevData.js';
import { startDevSimulator } from './services/devSimulator.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' },
});

app.locals.userLocations = {};
app.locals.io = io;

/* ---------- FIXED CORS (ONLY CHANGE) ---------- */
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://safefallkmgd.vercel.app"
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin || allowedOrigins.includes(origin)){
      callback(null,true);
    }else{
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials:true,
  methods:["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders:["Content-Type","Authorization"]
}));

app.options("*", cors());
/* --------------------------------------------- */

app.use(express.json());

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  app.use('/api', (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
    });
    next();
  });
}

app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(`user:${userId}`);
  }

  socket.on('location', (data) => {
    if (userId && data.lat != null && data.lng != null) {
      app.locals.userLocations[userId] = { lat: data.lat, lng: data.lng, updatedAt: new Date() };
    }
  });

  socket.on('sensor-data', (data) => {
    if (userId) {
      socket.broadcast.emit('sensor-data', { userId, ...data });
    }
  });

  socket.on('disconnect', () => {});
});

export const emitToUser = (userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitEmergency = (emergency) => {
  io.emit('emergency', emergency);
};

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  httpServer.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      await runSeed(app);
      startDevSimulator(app);
    }
  });
}

start().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
