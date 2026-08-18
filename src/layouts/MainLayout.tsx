import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { ToastContainer } from '../components/ToastContainer';
import { ScrollToTop } from '../components/ScrollToTop';

export function MainLayout() {
  return (
    <div className="layout-wrapper">
      <ScrollToTop />
      <ToastContainer />
      <AnnouncementBar />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
