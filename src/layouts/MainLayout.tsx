import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AnnouncementBar } from '../components/AnnouncementBar';

export function MainLayout() {
  return (
    <div className="layout-wrapper">
      <AnnouncementBar />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
