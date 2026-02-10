import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ No API key found');
    process.exit(1);
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    console.error('❌ native fetch not found. Please use Node.js 18 or higher.');
    process.exit(1);
}

async function listModels() {
    try {
        console.log('Fetching available models from Google AI API...');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.models) {
            console.log('\n✅ AVAILABLE MODELS:');
            console.log('------------------------');
            const validModels = data.models.filter(m => m.name.includes('flash') || m.name.includes('gemini'));

            validModels.forEach(m => {
                console.log(`- ${m.name.replace('models/', '')}`);
            });
            console.log('------------------------');
            console.log('\nCopy one of the names above (e.g., gemini-1.5-flash-001) to use in your config.');
        } else {
            console.log('❌ Failed to list models:', data);
        }

    } catch (error) {
        console.error('❌ Error listing models:', error.message);
    }
}

listModels();
