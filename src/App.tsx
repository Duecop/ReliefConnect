import React, { useEffect, useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import Resources from './pages/Resources';
import Volunteers from './pages/Volunteers';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Footer from './components/Footer';
import LanguageProvider from './components/LanguageProvider';
import TranslationDemo from './components/TranslationDemo';

// Create auth context
export const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user on mount
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" replace />} />
                <Route path="/translation-demo" element={<TranslationDemo />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </LanguageProvider>
    </AuthContext.Provider>
  );
}

export default App;