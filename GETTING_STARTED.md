# Getting Started - First Steps with Code Examples

## 🚀 IMMEDIATE ACTIONS (Start Here)

### Step 1: Environment Variables Setup

**Create `frontend/.env`:**
```env
VITE_API_URL=http://localhost:8000
```

**Create `frontend/.env.example`:**
```env
VITE_API_URL=http://localhost:8000
```

**Update `frontend/.gitignore`:**
```gitignore
# Add these lines if not present
.env
.env.local
.env.*.local
```

**Update `frontend/src/services/api.ts`:**
```typescript
// Change this:
const api = axios.create({
  baseURL: "http://localhost:8000",
  // ...
});

// To this:
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

### Step 2: Delete Unused Component

```bash
# Delete the unused file
rm frontend/src/components/RAGChatbot.tsx
```

---

### Step 3: Fix API Interceptor

**Current code in `frontend/src/services/api.ts`:**
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/auth"; // ❌ BAD
    }
    return Promise.reject(error);
  }
);
```

**Create `frontend/src/lib/navigation.ts`:**
```typescript
// Navigation helper that works outside React components
let navigateFunction: ((path: string) => void) | null = null;

export const setNavigate = (navigate: (path: string) => void) => {
  navigateFunction = navigate;
};

export const navigateTo = (path: string) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    // Fallback if navigate not set
    window.location.href = path;
  }
};
```

**Update `frontend/src/services/api.ts`:**
```typescript
import { navigateTo } from "@/lib/navigation";

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      navigateTo("/auth"); // ✅ GOOD
    }
    return Promise.reject(error);
  }
);
```

**Update `frontend/src/App.tsx`:**
```typescript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "@/lib/navigation";

function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  // ... rest of App
}
```

---

### Step 4: Create Error Boundary

**Create `frontend/src/components/ErrorBoundary.tsx`:**
```typescript
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-red-500/50 bg-red-500/10">
            <CardContent className="p-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
              <h2 className="text-xl font-semibold text-white">
                Something went wrong
              </h2>
              <p className="text-white/70">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = "/";
                  }}
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Update `frontend/src/App.tsx`:**
```typescript
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* ... rest of app */}
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

---

### Step 5: Create Skeleton Component

**Create `frontend/src/components/ui/skeleton.tsx`:**
```typescript
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

**Usage Example:**
```typescript
// Instead of:
{isLoading && <div>Loading...</div>}

// Use:
{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
) : (
  // Actual content
)}
```

---

### Step 6: Create Date Utilities

**Create `frontend/src/lib/dateUtils.ts`:**
```typescript
/**
 * Format date for display
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date as "Today is Tuesday, January 15, 2024"
 */
export const formatTodaysDate = (): string => {
  return `Today is ${formatDate(new Date())}`;
};

/**
 * Format time for display
 */
export const formatTime = (time: string): string => {
  // time is in HH:MM format
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Format date in YYYY-MM-DD (for API)
 */
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return formatDate(d);
};
```

---

### Step 7: Expand Constants File

**Update `frontend/src/lib/constants.ts`:**
```typescript
// Add these to existing constants

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/token",
    REGISTER: "/users/",
    CURRENT_USER: "/users/me",
  },
  PEOPLE: {
    LIST: "/people/",
    CREATE: "/people/",
    DETAIL: (id: number) => `/people/${id}`,
    UPDATE: (id: number) => `/people/${id}`,
    DELETE: (id: number) => `/people/${id}`,
  },
  MEDICATIONS: {
    LIST: "/medications/",
    CREATE: "/medications/",
    TODAY: "/medications/today",
    TRACK: (id: number) => `/medications/${id}/track`,
  },
  // ... add more as needed
} as const;

// Time Intervals
export const INTERVALS = {
  REMINDER_CHECK: 30000, // 30 seconds
  LOCATION_UPDATE: 60000, // 1 minute
  NOTIFICATION_CHECK: 30000, // 30 seconds
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
} as const;
```

---

## 🎯 NEXT: Start Phase 1 - Navigation

Once you've completed Steps 1-7 above, move to Phase 1 in `IMPLEMENTATION_ROADMAP.md`.

The foundation is now ready for the transformation!

