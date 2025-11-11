import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/toaster";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NotificationBanner } from "./components/shared/NotificationBanner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PageLoader } from "./components/lazy";
import {
    LandingPage,
    AuthPage,
    HomePage,
    AskMomentsPage,
    MyPeoplePage,
    PersonDetailPage,
    MyDayPage,
    MyPlacesPage,
    PlaceDetailPage,
    OnboardingFlow,
    EmergencyInfoPage,
    FamilySharingPage,
    MedicationsPage,
  } from "./components/lazy";
import { setNavigate } from "./lib/navigation";

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route
          path="/auth"
          element={
            <Suspense fallback={<PageLoader />}>
              <AuthPage type="login" />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<PageLoader />}>
              <AuthPage type="register" />
            </Suspense>
          }
        />
        
        {/* Onboarding route */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <OnboardingFlow />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Protected routes - New routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <HomePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-day"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <MyDayPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-people"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <MyPeoplePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-people/:personName"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <PersonDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ask-moments"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <AskMomentsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-places"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <MyPlacesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-places/:placeId"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <PlaceDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <EmergencyInfoPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medications"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <MedicationsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <FamilySharingPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-6 py-8">
                <h1 className="text-3xl font-semibold text-white">Settings</h1>
                <p className="mt-4 text-white/70">Coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-6 py-8">
                <h1 className="text-3xl font-semibold text-white">Help</h1>
                <p className="mt-4 text-white/70">Coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/more"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-6 py-8">
                <h1 className="text-3xl font-semibold text-white">More</h1>
                <p className="mt-4 text-white/70">Coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Legacy routes - redirect to new routes for backward compatibility */}
        <Route
          path="/dashboard"
          element={<Navigate to="/home" replace />}
        />
        <Route
          path="/chatbot"
          element={<Navigate to="/ask-moments" replace />}
        />
        <Route
          path="/memory-vault"
          element={<Navigate to="/my-people" replace />}
        />
        <Route
          path="/reminders"
          element={<Navigate to="/my-day" replace />}
        />
        <Route
          path="/locations"
          element={<Navigate to="/my-places" replace />}
        />

        {/* Redirect any unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppRoutes />
            <Toaster />
            <NotificationBanner />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
