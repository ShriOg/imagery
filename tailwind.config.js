/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-tint": "#fbbc00",
        "on-tertiary": "#003640",
        "surface-container": "#201f1f",
        "surface-dim": "#131313",
        "tertiary-fixed-dim": "#00d9fc",
        "primary-fixed-dim": "#fbbc00",
        "primary": "#ffe2ab",
        "on-primary-container": "#6d5000",
        "on-primary": "#402d00",
        "tertiary-container": "#04dcff",
        "secondary-container": "#474746",
        "on-secondary-container": "#b7b5b4",
        "on-secondary-fixed": "#1c1b1b",
        "tertiary": "#b4efff",
        "background": "#131313",
        "inverse-primary": "#795900",
        "secondary": "#c8c6c5",
        "surface-container-lowest": "#0e0e0e",
        "outline-variant": "#504532",
        "error-container": "#93000a",
        "on-primary-fixed": "#261a00",
        "on-error": "#690005",
        "surface-container-high": "#2a2a2a",
        "on-tertiary-container": "#005d6d",
        "on-tertiary-fixed-variant": "#004e5c",
        "on-error-container": "#ffdad6",
        "surface-variant": "#353534",
        "surface-container-highest": "#353534",
        "surface-container-low": "#1c1b1b",
        "inverse-on-surface": "#313030",
        "inverse-surface": "#e5e2e1",
        "on-tertiary-fixed": "#001f26",
        "primary-fixed": "#ffdfa0",
        "secondary-fixed-dim": "#c8c6c5",
        "on-surface": "#e5e2e1",
        "error": "#ffb4ab",
        "on-secondary": "#313030",
        "on-surface-variant": "#d4c5ab",
        "surface": "#131313",
        "tertiary-fixed": "#aaedff",
        "on-primary-fixed-variant": "#5c4300",
        "outline": "#9c8f78",
        "on-secondary-fixed-variant": "#474746",
        "secondary-fixed": "#e5e2e1",
        "on-background": "#e5e2e1",
        "surface-bright": "#3a3939"
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px"
      },
      spacing: {
        unit: "4px",
        "container-padding": "24px",
        "toolbar-item-gap": "8px",
        "panel-gap": "12px",
        gutter: "16px"
      },
      fontFamily: {
        "body-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "display-lg": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "500" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "500" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }]
      }
    }
  },
  plugins: [],
};
