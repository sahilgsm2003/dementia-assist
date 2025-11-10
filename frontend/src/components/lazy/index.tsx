import { lazy } from "react";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

// Loading fallback component
export const PageLoader = () => (
  <div className="container mx-auto px-6 py-8">
    <SkeletonCard />
  </div>
);

// Lazy load all route components
export const LandingPage = lazy(() => import("../LandingPage").then(m => ({ default: m.LandingPage })));
export const AuthPage = lazy(() => import("../AuthPage").then(m => ({ default: m.AuthPage })));
export const HomePage = lazy(() => import("../home/HomePage").then(m => ({ default: m.HomePage })));
export const AskMomentsPage = lazy(() => import("../ask-moments/AskMomentsPage").then(m => ({ default: m.AskMomentsPage })));
export const MyPeoplePage = lazy(() => import("../my-people/MyPeoplePage").then(m => ({ default: m.MyPeoplePage })));
export const PersonDetailPage = lazy(() => import("../my-people/PersonDetailPage").then(m => ({ default: m.PersonDetailPage })));
export const MyMemoriesPage = lazy(() => import("../my-memories/MyMemoriesPage").then(m => ({ default: m.MyMemoriesPage })));
export const MemoryDetailPage = lazy(() => import("../my-memories/MemoryDetailPage").then(m => ({ default: m.MemoryDetailPage })));
export const MyDayPage = lazy(() => import("../my-day/MyDayPage").then(m => ({ default: m.MyDayPage })));
export const MyPlacesPage = lazy(() => import("../my-places/MyPlacesPage").then(m => ({ default: m.MyPlacesPage })));
export const PlaceDetailPage = lazy(() => import("../my-places/PlaceDetailPage").then(m => ({ default: m.PlaceDetailPage })));
export const OnboardingFlow = lazy(() => import("../onboarding/OnboardingFlow").then(m => ({ default: m.OnboardingFlow })));
export const EmergencyInfoPage = lazy(() => import("../safety/EmergencyInfoPage").then(m => ({ default: m.EmergencyInfoPage })));
export const FamilySharingPage = lazy(() => import("../shared/FamilySharingPage").then(m => ({ default: m.FamilySharingPage })));
export const MedicationsPage = lazy(() => import("../medications/MedicationsPage").then(m => ({ default: m.MedicationsPage })));

