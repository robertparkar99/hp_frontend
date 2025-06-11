// utils/api.ts (or config/api.ts)

// Determine if we are in a development environment
// process.env.NODE_ENV is set by Next.js itself:
// 'development' for `npm run dev`
// 'production' for `npm run build` and `npm run start`
// const isDevelopment = process.env.NODE_ENV === 'development';

// // Conditionally set the API base URL
// export const API_BASE_URL: string = isDevelopment
//   ? process.env.NEXT_PUBLIC_API_BASE_URL_DEV! // '!' asserts non-null/undefined
//   : process.env.NEXT_PUBLIC_API_BASE_URL_PROD!; // '!' asserts non-null/undefined

// // Optional: Add a runtime check for robustness
// if (!API_BASE_URL) {
//   console.error("Error: API_BASE_URL is not defined. Check your .env.local file and ensure the environment variables are set correctly.");
//   // Depending on your application's needs, you might throw an error or set a fallback here.
// }
// Check if the current host is NOT a local development environment
const isProductionEnvironment = () => {
  if (typeof window === 'undefined') {
    // Server-side - use NODE_ENV as fallback
    return process.env.NODE_ENV === 'production';
  }

  // Client-side - check hostname
  const hostname = window.location.hostname;
  return !(
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') || // Common local network IP
    hostname.startsWith('10.0.') ||    // Common local network IP
    hostname.endsWith('.local') ||     // .local domains
    hostname.endsWith('.test') ||      // Test environments
    /^172\.(1[6-9]|2[0-9]|3[0-1])/.test(hostname) // 172.16-31 IP range
  );
};

// Conditionally set the API base URL
export const API_BASE_URL: string = isProductionEnvironment()
  ? process.env.NEXT_PUBLIC_API_BASE_URL_PROD!
  : process.env.NEXT_PUBLIC_API_BASE_URL_DEV!;

// Runtime validation
if (!API_BASE_URL) {
  console.error("API_BASE_URL is not defined. Please check your environment variables.");
  // Optionally provide a fallback URL or throw an error
  // throw new Error("API_BASE_URL is not configured");
}