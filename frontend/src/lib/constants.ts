/**
 * Design System Constants
 * Centralized design tokens for consistent styling across the application
 */

// Color Palette
export const colors = {
  primary: "#E02478",
  primaryHover: "#C01E66",
  primaryLight: "rgba(224, 36, 120, 0.15)",
  primaryDark: "rgba(224, 36, 120, 0.85)",
  
  background: "#05060a",
  surface: "rgba(255, 255, 255, 0.05)",
  surfaceHover: "rgba(255, 255, 255, 0.10)",
  surfaceElevated: "rgba(255, 255, 255, 0.08)",
  
  border: "rgba(255, 255, 255, 0.10)",
  borderHover: "rgba(255, 255, 255, 0.20)",
  borderLight: "rgba(255, 255, 255, 0.05)",
  
  text: {
    primary: "rgba(255, 255, 255, 1)",
    secondary: "rgba(255, 255, 255, 0.70)",
    tertiary: "rgba(255, 255, 255, 0.60)",
    muted: "rgba(255, 255, 255, 0.50)",
    disabled: "rgba(255, 255, 255, 0.40)",
  },
  
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
} as const;

// Spacing Scale (based on 4px base unit)
export const spacing = {
  xs: "0.5rem",    // 8px
  sm: "0.75rem",   // 12px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "3rem",   // 48px
  "3xl": "4rem",   // 64px
  "4xl": "6rem",   // 96px
} as const;

// Border Radius
export const borderRadius = {
  sm: "0.375rem",   // 6px
  md: "0.5rem",     // 8px
  lg: "0.75rem",   // 12px
  xl: "1rem",      // 16px
  "2xl": "1.5rem",  // 24px
  "3xl": "2rem",   // 32px
  full: "9999px",
} as const;

// Typography
export const typography = {
  fontFamily: {
    sans: ["Montserrat", "system-ui", "sans-serif"],
  },
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
    "6xl": "3.75rem",  // 60px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

// Shadows
export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  primary: "0 10px 25px -5px rgba(224, 36, 120, 0.3)",
  primaryHover: "0 20px 35px -5px rgba(224, 36, 120, 0.4)",
} as const;

// Animation Durations
export const animation = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.75,
} as const;

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/token",
    REGISTER: "/users/",
    CURRENT_USER: "/users/me",
  },
  CHAT: {
    SEND_QUESTION: "/rag/chat/query",
    HISTORY: "/rag/chat/history",
  },
  DOCUMENTS: {
    UPLOAD: "/rag/documents/upload",
    LIST: "/rag/documents/",
    DELETE: (id: number) => `/rag/documents/${id}`,
    RESET: "/rag/knowledge-base/reset",
    INITIALIZE_DEMO: "/rag/initialize-demo",
  },
  PEOPLE: {
    LIST: "/people/",
    CREATE: "/people/",
    DETAIL: (id: number) => `/people/${id}`,
    UPDATE: (id: number) => `/people/${id}`,
    DELETE: (id: number) => `/people/${id}`,
    PHOTOS: (id: number) => `/people/${id}/photos`,
    MEMORIES: (id: number) => `/people/${id}/memories`,
  },
  MEMORIES: {
    PHOTOS: "/memories/photos",
    SEARCH: "/memories/photos/search",
  },
  REMINDERS: {
    LIST: "/reminders/",
    CREATE: "/reminders/",
    UPDATE: (id: number) => `/reminders/${id}`,
    DELETE: (id: number) => `/reminders/${id}`,
    COMPLETE: (id: number) => `/reminders/${id}/complete`,
    SNOOZE: (id: number) => `/reminders/${id}/snooze`,
  },
  LOCATIONS: {
    LIST: "/locations/",
    CREATE: "/locations/",
    UPDATE: (id: number) => `/locations/${id}`,
    DELETE: (id: number) => `/locations/${id}`,
    LIVE: "/locations/live",
  },
    MEDICATIONS: {
      LIST: "/medications/",
      CREATE: "/medications/",
      UPDATE: (id: number) => `/medications/${id}`,
      DELETE: (id: number) => `/medications/${id}`,
      TODAY: "/medications/today",
      TRACK: (id: number) => `/medications/${id}/track`,
    },
        EMERGENCY: {
          GET: "/emergency/",
          CREATE: "/emergency/",
          UPDATE: "/emergency/",
        },
        VOICE_NOTES: {
          CREATE: "/voice-notes/",
          GET: (id: string) => `/voice-notes/${id}`,
          DELETE: (id: string) => `/voice-notes/${id}`,
          LIST: "/voice-notes/",
        },
        QUICK_FACTS: {
          GET: "/users/me/quick-facts",
          UPDATE: "/users/me/quick-facts",
        },
        SEARCH: {
          GLOBAL: "/search",
        },
        FAMILY: {
          INVITE: "/family/invite",
          MEMBERS: "/family/members",
          ACTIVITY: "/family/activity",
          ACCEPT_INVITE: (id: number) => `/family/accept-invite/${id}`,
          REMOVE_MEMBER: (id: number) => `/family/members/${id}`,
        },
} as const;

// Time Intervals (in milliseconds)
export const INTERVALS = {
  REMINDER_CHECK: 30000, // 30 seconds
  LOCATION_UPDATE: 60000, // 1 minute
  NOTIFICATION_CHECK: 30000, // 30 seconds
  CHAT_POLL: 5000, // 5 seconds
} as const;

// File Limits
export const FILE_LIMITS = {
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ACCEPTED_DOCUMENT_TYPES: ["application/pdf"],
} as const;

// Validation Rules
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;

// Common Time Formats
export const TIME_FORMATS = {
  DISPLAY: "h:mm A", // 2:30 PM
  INPUT: "HH:mm", // 14:30
  DATE_DISPLAY: "MMMM d, yyyy", // January 15, 2024
  DATE_INPUT: "yyyy-MM-dd", // 2024-01-15
} as const;

