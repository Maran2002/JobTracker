import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'vibe-toast';
import AuthGuard from './routes/AuthGuard';
import MainLayout from './layouts/MainLayout';

// Placeholder components for routing
const Login = () => <div className="p-10"><h1>Login Page</h1></div>;
const Dashboard = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p className="text-default-500">Welcome back! Here's an overview of your job applications.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="p-6 rounded-xl bg-content2 border border-divider">
        <h3 className="text-lg font-semibold">Applied</h3>
        <p className="text-3xl font-bold mt-2">12</p>
      </div>
      <div className="p-6 rounded-xl bg-content2 border border-divider">
        <h3 className="text-lg font-semibold">Interviews</h3>
        <p className="text-3xl font-bold mt-2">4</p>
      </div>
      <div className="p-6 rounded-xl bg-content2 border border-divider">
        <h3 className="text-lg font-semibold">Offers</h3>
        <p className="text-3xl font-bold mt-2">1</p>
      </div>
    </div>
  </div>
);
const NotFound = () => <div className="p-10 text-center"><h1>404 - Not Found</h1></div>;

function App() {
  return (
    <HeroUIProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </AuthGuard>
            } 
          />
          
          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />
    </HeroUIProvider>
  );
}

export default App;
