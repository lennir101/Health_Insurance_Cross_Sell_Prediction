import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface NavLink {
  to: string;
  label: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  links?: NavLink[];
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, links }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 頂部導航欄 */}
      <Header links={links} />
      
      {/* 主要內容區域 */}
      <main className="flex-1 container py-6 md:py-10">
        {children}
      </main>
      
      {/* 頁腳 */}
      <Footer />
    </div>
  );
};

export default MainLayout; 