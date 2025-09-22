/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Scan all files in the app directory
    "./pages/**/*.{js,ts,jsx,tsx}", // Include pages if applicable
    "./app/globals.css", // Explicitly include globals.css
  ],
  theme: {
    extend: {
      borderColor: {
        'border': 'hsl(var(--border))', // Optional: Predefine for consistency
      },
      backgroundColor: {
        'background': 'hsl(var(--background))', // Optional: Predefine for consistency
      },
    },
  },
  plugins: [],
};