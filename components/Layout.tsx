import React, { ReactNode } from 'react';
import { Sidebar } from "@/components/sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url("https://img.freepik.com/free-photo/abstract-surface-textures-white-concrete-stone-wall_74190-8189.jpg?ga=GA1.1.905198673.1742757022&semt=ais_hybrid&w=740")`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Include the sidebar */}
      <Sidebar />
      
      {/* Main content area - offset from left on desktop */}
      <div className="md:pl-64 ">
        <main className="sm:p-6 p-1 md:mt-0 pt-12  min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;