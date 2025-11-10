import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Start notification service when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      notificationService.start();
    } else {
      notificationService.stop();
    }

    // Cleanup when component unmounts or auth changes
    return () => {
      if (!isAuthenticated) {
        notificationService.stop();
      }
    };
  }, [isAuthenticated]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#E02478]"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the attempted location
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return <>{children}</>;
};
