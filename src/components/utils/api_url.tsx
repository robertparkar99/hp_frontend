// utils/api.ts (or config/api.ts)

// Determine if we are in a development environment
// process.env.NODE_ENV is set by Next.js itself:
// 'development' for `npm run dev`
// 'production' for `npm run build` and `npm run start`
const isDevelopment = process.env.NODE_ENV === 'development';

// Conditionally set the API base URL
export const API_BASE_URL: string = isDevelopment
  ? process.env.NEXT_PUBLIC_API_BASE_URL_DEV! // '!' asserts non-null/undefined
  : process.env.NEXT_PUBLIC_API_BASE_URL_PROD!; // '!' asserts non-null/undefined

// Optional: Add a runtime check for robustness
if (!API_BASE_URL) {
  console.error("Error: API_BASE_URL is not defined. Check your .env.local file and ensure the environment variables are set correctly.");
  // Depending on your application's needs, you might throw an error or set a fallback here.
}