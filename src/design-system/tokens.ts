/**
 * Orbit Apple-Quality Product Design System Tokens
 * Reference specification for colors, typography, spacing, motion, layout, and surfaces.
 */

export const tokens = {
  colors: {
    base: {
      white: "#FFFFFF",
      secondary: "#F5F5F7", // Apple's signature light surface
      tertiary: "#EBEBED",
      overlay: "rgba(0, 0, 0, 0.4)",
    },
    dark: {
      background: "#000000",
      elevated: "#1C1C1E",
      secondaryElevated: "#2C2C2E",
      tertiaryElevated: "#3A3A3C",
      border: "#38383A",
    },
    text: {
      primary: "#1D1D1F", // Apple standard dark
      secondary: "#6E6E73", // Apple standard secondary gray
      tertiary: "#86868B",
      inverse: "#FFFFFF",
      link: "#0071E3",
    },
    orbitBlue: {
      50: "#F0F7FF",
      100: "#E0EFFF",
      200: "#B9DCFF",
      300: "#7CB9FF",
      400: "#3892FF",
      500: "#0071E3", // Refined Orbit / Apple Blue
      600: "#005BB8",
      700: "#004894",
      800: "#003875",
      900: "#002857",
      subtleSurface: "rgba(0, 113, 227, 0.06)",
      subtleBorder: "rgba(0, 113, 227, 0.18)",
    },
    border: {
      subtle: "#E5E5EA",
      hover: "#D1D1D6",
      focus: "#0071E3",
      divider: "#F0F0F2",
    },
    status: {
      success: {
        bg: "#E8F8EE",
        text: "#1D7F3E",
        border: "#C1EAD0",
      },
      warning: {
        bg: "#FFF7EB",
        text: "#9A6300",
        border: "#FDE0B2",
      },
      danger: {
        bg: "#FDEEEF",
        text: "#C42B37",
        border: "#F9CBD0",
      },
      info: {
        bg: "#EDF5FD",
        text: "#0C66C2",
        border: "#C7DFF8",
      },
    },
    atmosphere: {
      opportunities: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 113, 227, 0.04) 0%, rgba(50, 173, 230, 0.02) 50%, rgba(255, 255, 255, 0) 100%)",
      projects: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(52, 199, 89, 0.04) 0%, rgba(0, 113, 227, 0.02) 50%, rgba(255, 255, 255, 0) 100%)",
      events: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 149, 0, 0.04) 0%, rgba(255, 45, 85, 0.02) 50%, rgba(255, 255, 255, 0) 100%)",
      hackathons: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 113, 227, 0.04) 0%, rgba(255, 149, 0, 0.02) 50%, rgba(255, 255, 255, 0) 100%)",
      dots: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(88, 86, 214, 0.04) 0%, rgba(0, 113, 227, 0.03) 50%, rgba(255, 255, 255, 0) 100%)",
      profile: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 113, 227, 0.03) 0%, rgba(142, 142, 147, 0.02) 50%, rgba(255, 255, 255, 0) 100%)",
    },
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, sans-serif',
      mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    sizes: {
      editorialTitle: "clamp(2.5rem, 4vw + 1rem, 4.25rem)",
      pageTitle: "clamp(1.875rem, 2.5vw + 0.75rem, 2.75rem)",
      sectionTitle: "1.5rem",
      cardTitle: "1.125rem",
      bodyLarge: "1.125rem",
      body: "0.9375rem",
      subtext: "0.8125rem",
      caption: "0.6875rem",
    },
    lineHeights: {
      tight: "1.1",
      snug: "1.25",
      normal: "1.5",
      relaxed: "1.65",
    },
    letterSpacing: {
      tighter: "-0.03em",
      tight: "-0.02em",
      normal: "0",
      wide: "0.02em",
      caps: "0.06em",
    },
  },
  spacing: {
    sidebarWidth: 260,
    sidebarCollapsedWidth: 76,
    headerHeight: 56,
    contentMaxWidth: "76rem", // 1216px max width for comfortable editorial line lengths
    wideContentMaxWidth: "90rem", // 1440px
  },
  radii: {
    none: "0",
    xs: "4px",
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "18px",
    "2xl": "24px",
    full: "9999px",
  },
  shadows: {
    subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
    elevated: "0 4px 16px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
    modal: "0 20px 48px -12px rgba(0, 0, 0, 0.18), 0 1px 3px 0 rgba(0, 0, 0, 0.06)",
    focus: "0 0 0 3px rgba(0, 113, 227, 0.25)",
  },
  motion: {
    durations: {
      fast: "150ms",
      normal: "240ms",
      slow: "400ms",
      reveal: "600ms",
    },
    easing: {
      appleDefault: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
      appleSpring: "cubic-bezier(0.16, 1, 0.3, 1)",
      easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    },
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  zIndex: {
    base: 1,
    header: 30,
    sidebar: 40,
    drawer: 45,
    modal: 50,
    toast: 60,
  },
} as const;

export type DesignTokens = typeof tokens;
