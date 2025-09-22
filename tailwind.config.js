/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Scan all app files
    "./pages/**/*.{js,ts,jsx,tsx}", // Include pages if any
    "./app/globals.css", // Explicitly include globals.css
  ],
  theme: {
    extend: {
      backgroundColor: {
        'background': 'hsl(var(--background))',
      },
      borderColor: {
        'border': 'hsl(var(--border))',
      },
      textColor: {
        'foreground': 'hsl(var(--foreground))', // Fallback for text-foreground
      },
    },
  },
  plugins: [],
};