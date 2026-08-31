import 'dotenv/config';
import { app } from './app.js';
import { db } from './db/storage.js';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database (PostgreSQL if DATABASE_URL is set, or local JSON)
    await db.init();

    app.listen(PORT, () => {
      console.log(`🚀 FarmGo SaaS Backend running on port ${PORT}`);
      console.log(`📡 API base: http://localhost:${PORT}/api/v1`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
