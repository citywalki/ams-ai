import {useEffect, useState} from 'react';
import {Outlet} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {Header} from './Header';
import {Sidebar} from './Sidebar';
import {cn} from '@/lib/utils';

export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuToggle = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <Header onMenuToggle={handleMenuToggle} />

      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        <AnimatePresence>
          {isMobile && isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(!isMobile || isMobileMenuOpen) && (
            <motion.div
              initial={isMobile ? { x: -256 } : false}
              animate={{ x: 0 }}
              exit={isMobile ? { x: -256 } : undefined}
              transition={{ duration: 0.3 }}
              className={cn(
                "z-40 h-full",
                isMobile && "fixed inset-y-0 left-0 p-3"
              )}
            >
              <Sidebar
                isCollapsed={isMobile ? false : isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
            </motion.div>
          )}
        </AnimatePresence>

          <main className="flex-1 min-h-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full min-h-0 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
