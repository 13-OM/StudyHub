const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const requestRoutes = require('./routes/requestRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ---------------------- Global middleware ----------------------
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---------------------- API Routes ----------------------

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    database:
      require('mongoose').connection.readyState === 1
        ? 'connected'
        : 'disconnected',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/stats', statsRoutes);

// ---------------------- Serve React Frontend ----------------------

// In production, frontend/dist is created by the Render build command
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');

  app.use(express.static(frontendPath));

  // React SPA fallback
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ---------------------- API Root ----------------------

app.get('/', (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.sendFile(
      path.join(__dirname, '../frontend/dist/index.html')
    );
  }

  res.json({
    success: true,
    message: 'StudyHub API is running 🎓',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// ---------------------- Error handling ----------------------

app.use(notFound);
app.use(errorHandler);

// ---------------------- Server ----------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `\n🎓 StudyHub API listening on port ${PORT}`
  );
  console.log(
    `   Environment: ${process.env.NODE_ENV || 'development'}\n`
  );
});

module.exports = app;
