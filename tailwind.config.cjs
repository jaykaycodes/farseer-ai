const theme = require('tailwindcss/defaultTheme')

const REM_SIZE = 16
function checkValue(obj, key, value) {
  if (typeof value === 'string' && value.endsWith('rem')) {
    obj[key] = parseFloat(value) * REM_SIZE + 'px'
  }
}

const remToPx = (obj) => {
  if (typeof obj !== 'object') {
    return
  }

  if (Array.isArray(obj)) {
    obj.forEach((value, key) => {
      remToPx(value)
      checkValue(obj, key, value)
    })
    return
  }
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    remToPx(value)
    checkValue(obj, key, value)
  })
}
remToPx(theme)

/** @type {import('tailwindcss').Config} */
module.exports = {
  // So we don't pick up dark mode from webpages that are using "dark" class
  darkMode: ['class', '[data-farseer-color-scheme="dark"]'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...theme,
      fontFamily: {
        sans: ['Inter', '"PT Sans"', ...theme.fontFamily.sans],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    logs: false,
  },
}
