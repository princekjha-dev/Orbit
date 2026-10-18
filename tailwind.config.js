/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/design-system/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        // Apple-grade palette
        apple: {
          canvas: "#FFFFFF",
          subtle: "#F5F5F7",
          border: "#E5E5EA",
          hover: "#F2F2F7",
          text: "#1D1D1F",
          secondary: "#6E6E73",
          tertiary: "#86868B",
          blue: "#0071E3",
          blueHover: "#0077ED",
          blueSubtle: "rgba(0, 113, 227, 0.08)",
        },
        brand: {
          50: "#F0F7FF",
          100: "#E0EFFF",
          200: "#B9DCFF",
          300: "#7CB9FF",
          400: "#3892FF",
          500: "#0071E3",
          600: "#0062C4",
          700: "#004894",
          800: "#003875",
          900: "#002857",
          950: "#001633",
        },
        neutral: {
          0: "#ffffff",
          50: "#f5f5f7",
          100: "#eeeeef",
          150: "#e5e5ea",
          200: "#e0e0e3",
          300: "#d1d1d6",
          400: "#aeaeb2",
          500: "#8e8e93",
          600: "#636366",
          700: "#3a3a3c",
          800: "#2c2c2e",
          900: "#1d1d1f",
          950: "#000000",
        },
        success: {
          50: "#E8F8EE",
          500: "#34C759",
          700: "#1D7F3E",
        },
        warning: {
          50: "#FFF7EB",
          500: "#FF9500",
          700: "#9A6300",
        },
        danger: {
          50: "#FDEEEF",
          500: "#FF3B30",
          700: "#C42B37",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)",
        "card-hover": "0 6px 20px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        modal: "0 24px 64px -12px rgba(0, 0, 0, 0.16)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "reveal": "reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        reveal: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
