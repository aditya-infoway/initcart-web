import { Outlet } from 'react-router-dom';
import Header2 from './components/Header2';
import Footer from './components/Footer';

export default function ServiceLayout() {
  return (
    <>
      <Header2 />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
