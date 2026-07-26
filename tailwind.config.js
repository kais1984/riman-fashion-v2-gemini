module.exports = {
  content: [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      borders: {
        primary: '#d4a574',
        accent: '#b8860b'
      },
      ring: {
        gold: '2px solid #d4a574',
        gold-30: '2px solid #d4a574/30',
        gold-60: '2px solid #d4a574/60'
      },
      colors: {
        gold: '#d4a574',
        gold-50: '#d4a574/50',
        gold-100: '#d4a574/100',
        ivory: '#f8f4e8'
      }
    },
    colors: {
      gold: '#d4a574',
      gold-60: '#d4a574/60'
    }
  },
  plugins: [
    [
      'respect',
      {
        theme: module.exports.theme,
        respect: true
      }
    ]
  ]
}