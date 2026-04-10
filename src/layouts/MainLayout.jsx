import React from 'react';
import { Button } from '@heroui/react';
import { LogOut, Home, Briefcase, FileText } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar/Navigation Placeholder */}
      <nav className="border-b border-divider bg-content1 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Briefcase className="text-primary" size={24} />
          <span className="font-bold text-xl tracking-tight">JobTracker</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-6">
            <a href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <Home size={16} /> Dashboard
            </a>
            <a href="/jobs" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <FileText size={16} /> My Applications
            </a>
          </div>
          
          <div className="flex items-center gap-3 border-l border-divider pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.name || 'User'}</p>
              <p className="text-xs text-default-500">{user?.role || 'Job Seeker'}</p>
            </div>
            <Button 
              isIconOnly 
              variant="flat" 
              color="danger" 
              size="sm" 
              onClick={logout}
              title="Logout"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
      
      {/* Footer Placeholder */}
      <footer className="border-t border-divider mt-auto py-6 text-center text-default-400 text-sm">
        &copy; {new Date().getFullYear()} JobTracker. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
