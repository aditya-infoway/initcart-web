//src/EcomLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../src/components/Header.jsx';
import Footer from '../src/components/Footer.jsx';

export default function EcomLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
