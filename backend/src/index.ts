
import { app } from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 FarmGo SaaS Backend running at http://localhost:${PORT}`);
  console.log(`📡 API base: http://localhost:${PORT}/api/v1`);
});
