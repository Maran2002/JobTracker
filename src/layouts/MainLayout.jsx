import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children, searchPlaceholder }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-wrapper">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          searchPlaceholder={searchPlaceholder}
        />

        <main className="main-content" id="main-content" role="main">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
