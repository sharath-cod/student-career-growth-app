require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
  console.error('JWT_SECRET is missing or too short (min 24 chars). Set it in backend/.env');
  process.exit(1);
}

const app = express();
// Render/Railway/etc. sit behind a proxy. Needed so rate limiting sees each user's real IP.
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  })
);
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Uploaded certificate files are NOT served statically; Phase 4 serves them through an authenticated route.
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));
const rateLimit = require('express-rate-limit');
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 1500, standardHeaders: true, legacyHeaders: false }));

const data = require('./routes/studentData');
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/meta', require('./routes/metaRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/skills', data.skillsRouter);
app.use('/api/technologies', data.technologiesRouter);
app.use('/api/certificates', data.certificatesRouter);
app.use('/api/projects', data.projectsRouter);
app.use('/api/activities', data.activitiesRouter);
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/career', require('./routes/careerRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => require('./services/seedJobRoles')().catch((e) => console.error('Job role sync failed:', e.message)))
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
