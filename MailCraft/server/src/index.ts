import app from './app';
import { config } from './config';

const start = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║         NewsletterAI Server Started          ║
╠══════════════════════════════════════════════╣
║  Port:        ${String(config.port).padEnd(30)}║
║  Environment: ${config.nodeEnv.padEnd(30)}║
║  API:         http://localhost:${config.port}/api       ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
