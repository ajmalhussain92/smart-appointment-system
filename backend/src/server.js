const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const os = require('os');
const socketService = require('./services/socketService');
const { startReminderJob } = require('./services/reminderService');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('ERROR: MONGODB_URI or MONGO_URI not found in environment variables');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET not found in environment variables');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set('io', io);
socketService.init(io);

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    startReminderJob();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, '0.0.0.0', () => {
      const interfaces = os.networkInterfaces();
      const ips = [];
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) ips.push(iface.address);
        }
      }
      console.log(`\n✅ Server running on:`);
      console.log(`   Local:   http://localhost:${PORT}`);
      ips.forEach(ip => console.log(`   Network: http://${ip}:${PORT}`));
      if (ips.length > 0) console.log(`\n📱 Mobile Access: http://${ips[0]}:${PORT}\n`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
