module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        fadeUp: 'fadeUp 0.4s ease',
        pulse: 'pulse 2s infinite',
        spin: 'spin 0.8s linear infinite',
        confetti: 'confetti 1.2s ease forwards',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateY(80px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}