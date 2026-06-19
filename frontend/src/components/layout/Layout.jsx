import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-base flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-6xl w-full px-4 py-8 sm:px-6 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
