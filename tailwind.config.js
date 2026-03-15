/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': 'var(--primary-green)',
        'soft-cream': 'var(--soft-cream)',
        'deep-charcoal': 'var(--deep-charcoal)',
        'light-sage': 'var(--light-sage)',
        'accent-gold': 'var(--accent-gold)',
        'border-color': 'var(--border-color)',
        'main-bg': 'var(--main-bg)',
        'card-bg': 'var(--card-bg)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'warm-gold': 'var(--warm-gold)',
        'light-gold': 'var(--light-gold)'
      },
      fontFamily: {
        'serif': 'var(--font-serif)',
        'mono': 'var(--font-mono)',
        'sans': 'var(--font-sans)',
      },
    },
  },
  plugins: [],
}
