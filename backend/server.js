require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server: SocketServer } = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();
const httpServer = http.createServer(app);

if (process.env.NODE_ENV !== 'test') connectDB();

// CORS — only allow the configured frontend origin
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',');
const corsOptions = {
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    const err = new Error('Not allowed by CORS');
    err.status = 403;
    cb(err);
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Socket.io
if (process.env.NODE_ENV !== 'test') {
  const io = new SocketServer(httpServer, { cors: corsOptions });
  app.set('io', io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });
  });
}

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '10kb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));


if (process.env.NODE_ENV !== 'test') {
  require('./config/passport');
  app.use('/api/auth/google', require('./routes/googleAuth'));
}
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/jobs',         require('./routes/jobs'));
app.use('/api/companies',    require('./routes/companies'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api',              require('./routes/messaging'));

// Global error handler — never leaks stack traces to clients
app.use((err, req, res, _next) => {
  // MongoDB duplicate key (e.g. duplicate application)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate entry' });
  }
  // Mongoose validation error (e.g. enum mismatch, required field)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  // Multer file size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5 MB.' });
  }
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ message });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
