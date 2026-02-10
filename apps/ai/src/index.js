import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { startFlowServer } from '@genkit-ai/express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for proper path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
console.log('📋 Loading environment from:', envPath);
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.error('❌ Error loading .env.local:', envResult.error.message);
}

// Validate environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('');
  console.error('❌ ERROR: GEMINI_API_KEY environment variable not found.');
  console.error('📝 Please add your Gemini API key to apps/ai/.env.local');
  console.error('🔗 Get your API key from: https://aistudio.google.com/app/apikey');
  console.error('');
  process.exit(1);
}

console.log('✅ GEMINI_API_KEY found:', GEMINI_API_KEY.substring(0, 10) + '...');

// Initialize genkit with the plugin
console.log('🔧 Initializing Genkit...');
const gk = genkit({
  plugins: [googleAI({ apiKey: GEMINI_API_KEY })],
});

// Import and create flows
console.log('📦 Loading flows...');

async function main() {
  try {
    const { jobRoleCompetencyFlow } = await import('./flows/jobRoleCompetencyFlow.js');
    const { jobRoleCompetencyTestFlow } = await import('./flows/jobRoleCompetencyTestFlow.js');
    const { buildWithAIFlow } = await import('./flows/buildWithAIFlow.js');

    const jobRoleCompetencyFlowInstance = jobRoleCompetencyFlow(gk);
    const jobRoleCompetencyTestFlowInstance = jobRoleCompetencyTestFlow(gk);
    const buildWithAIFlowInstance = buildWithAIFlow(gk);

    console.log('✅ All flows loaded successfully');

    // Start the Flow Server
    console.log('🚀 Starting Genkit Flow Server on port 3400...');

    await startFlowServer({
      flows: [
        jobRoleCompetencyFlowInstance,
        jobRoleCompetencyTestFlowInstance,
        buildWithAIFlowInstance,
      ],
      port: 3400,
    });

    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║  ✅ Genkit Server is RUNNING!          ║');
    console.log('║  🌐 http://localhost:3400              ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('📋 Available flows:');
    console.log('  • jobRoleCompetencyFlow');
    console.log('  • jobRoleCompetencyTestFlow');
    console.log('  • buildWithAIFlow (Gemini 2.5 Flash)');
    console.log('');
    console.log('💡 Keep this terminal open. Press Ctrl+C to stop.');
    console.log('');

    // Keep the process alive with a heartbeat interval
    const keepAlive = setInterval(() => {
      // This interval keeps Node.js event loop active
    }, 60000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down Genkit server...');
      clearInterval(keepAlive);
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down Genkit server...');
      clearInterval(keepAlive);
      process.exit(0);
    });

  } catch (error) {
    console.error('');
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    console.error('');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Start the server
main();