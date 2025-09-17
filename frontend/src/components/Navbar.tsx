import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const Navbar = ({ onNavigate, isAuthenticated, onLogout }: NavbarProps) => {
  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      style={{
        backgroundColor: useTransform(scrollY, [0, 100], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']),
        backdropFilter: useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(20px)']),
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onNavigate('landing')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart className="h-8 w-8 text-[#E02478]" />
          <span className="text-2xl font-bold text-white">Moments</span>
        </motion.div>

        <div className="flex items-center space-x-6">
          {!isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                onClick={() => onNavigate('features')}
                className="hover:text-[#E02478] transition-colors"
              >
                Features
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate('about')}
                className="hover:text-[#E02478] transition-colors"
              >
                About
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('login')}
              >
                Log In
              </Button>
              <Button
                onClick={() => onNavigate('register')}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => onNavigate('dashboard')}
                className="hover:text-[#E02478] transition-colors"
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
              >
                Log Out
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};