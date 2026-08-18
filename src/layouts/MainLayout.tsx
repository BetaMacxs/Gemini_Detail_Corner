import { Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { ToastContainer } from '../components/ToastContainer';

export function MainLayout() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="layout-wrapper">
      <ToastContainer />
      <AnnouncementBar />
      <Header />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <motion.div
          key={location.pathname}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.45, ease: 'easeOut' }
          }
          style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
