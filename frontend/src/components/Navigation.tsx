import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

interface NavigationProps {
  className?: string;
}

/**
 * Unified Navigation Component
 * Shows BottomNav on mobile, Sidebar on desktop
 */
export const Navigation = ({ className }: NavigationProps) => {
  // Safely get auth context - Sidebar and BottomNav will handle their own auth checks
  return (
    <>
      <Sidebar className={className} />
      <BottomNav className={className} />
    </>
  );
};

