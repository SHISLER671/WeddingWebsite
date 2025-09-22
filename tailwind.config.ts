import type { Config } from 'tailwindcss';

const config: Config = {
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
        'foreground': 'hsl(var(--foreground))', // Define text-foreground
      },
    },
  },
  plugins: [],
};

export default config;