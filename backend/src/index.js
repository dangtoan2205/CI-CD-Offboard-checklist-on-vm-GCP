// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const session = require('express-session');
// const ticketsRouter = require('./routes/tickets');
// const authRouter = require('./routes/auth');
// const adminUsersRouter = require('./routes/adminUsers');

// const app = express();
// const PORT = process.env.PORT || 4000;

// const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
//   .split(',')
//   .map((o) => o.trim())
//   .filter(Boolean);

// app.use(cors({
//   origin(origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     return callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
// }));
// app.use(express.json());

// app.use(session({
//   name: 'offboard.sid',
//   secret: process.env.SESSION_SECRET || 'offboard-secret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     sameSite: 'lax',
//     secure: process.env.SESSION_SECURE === 'true',
//     maxAge: 1000 * 60 * 60 * 8,
//   },
// }));

// app.use('/api/auth', authRouter);
// app.use('/api/admin/users', adminUsersRouter);
// app.use('/api/tickets', ticketsRouter);

// app.get('/api/health', (req, res) => {
//   res.json({ ok: true });
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const ticketsRouter = require('./routes/tickets');
const authRouter = require('./routes/auth');
const adminUsersRouter = require('./routes/adminUsers');

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * =========================
 * CORS CONFIG (DYNAMIC)
 * =========================
 * - Không hard-code IP
 * - Không cần rebuild khi đổi server
 * - Không set FRONTEND_URL → allow all (internal app)
 */
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : null;

app.use(cors({
  origin(origin, callback) {
    // Cho phép request không có origin (Postman, curl, server-side)
    if (!origin) return callback(null, true);

    // Nếu không khai báo FRONTEND_URL → cho phép tất cả
    if (!allowedOrigins) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

/**
 * =========================
 * SESSION CONFIG
 * =========================
 */
app.use(session({
  name: 'offboard.sid',
  secret: process.env.SESSION_SECRET || 'offboard-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.SESSION_SECURE === 'true',
    maxAge: 1000 * 60 * 60 * 8, // 8 tiếng
  },
}));

/**
 * =========================
 * ROUTES
 * =========================
 */
app.use('/api/auth', authRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/tickets', ticketsRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

/**
 * =========================
 * START SERVER
 * =========================
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
