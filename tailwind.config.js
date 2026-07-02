/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Custom Font Sizes for Mobile Detail Pages ──────────────────
      fontSize: {
        // Headings
        'detail-title': ['18px', { lineHeight: '1.4', fontWeight: '700' }],
        'detail-subtitle': ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        'detail-card-title': ['15px', { lineHeight: '1.4', fontWeight: '700' }],
        
        // Body text
        'detail-body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'detail-text': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'detail-small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'detail-xs': ['11px', { lineHeight: '1.3', fontWeight: '400' }],
        
        // Labels & Values
        'detail-label': ['10px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '0.05em' }],
        'detail-value': ['13px', { lineHeight: '1.4', fontWeight: '600' }],
        
        // Buttons
        'detail-btn': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        'detail-btn-sm': ['12px', { lineHeight: '1.3', fontWeight: '500' }],
        
        // Inputs
        'detail-input': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        
        // Prices
        'detail-price': ['16px', { lineHeight: '1.3', fontWeight: '700' }],
        'detail-price-lg': ['18px', { lineHeight: '1.3', fontWeight: '700' }],
        
        // Icons (for spacing)
        'detail-icon': ['18px', { lineHeight: '1' }],
        'detail-icon-sm': ['14px', { lineHeight: '1' }],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ]
}