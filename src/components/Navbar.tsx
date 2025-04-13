import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, Box, Users, LayoutDashboard, User, LogIn, Menu, X } from 'lucide-react';
import { AuthContext } from '../App';
import NotificationCenter from './NotificationCenter';

function Navbar() {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary-600' : '';
  };

  return (
    <nav className={`${scrolled ? 'bg-primary-600 shadow-md' : 'bg-primary-500'} text-white transition-all duration-300 fixed w-full z-50`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl transition-transform hover:scale-105">
            <AlertCircle className="h-6 w-6" />
            <span>ReliefConnect</span>
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-md hover:bg-primary-600 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-400 ${isActive('/')}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/incidents"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-400 ${isActive('/incidents')}`}
            >
              <AlertCircle className="h-4 w-4" />
              <span>Incidents</span>
            </Link>
            
            <Link
              to="/resources"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-400 ${isActive('/resources')}`}
            >
              <Box className="h-4 w-4" />
              <span>Resources</span>
            </Link>
            
            <Link
              to="/volunteers"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-400 ${isActive('/volunteers')}`}
            >
              <Users className="h-4 w-4" />
              <span>Volunteers</span>
            </Link>
            
            {!loading && (
              <>
                {user && <NotificationCenter />}
                
                {user ? (
                  <Link
                    to="/profile"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-400 ${isActive('/profile')}`}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-400 ${isActive('/auth')}`}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary-600 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-400 ${isActive('/')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/incidents"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-400 ${isActive('/incidents')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <AlertCircle className="h-4 w-4" />
              <span>Incidents</span>
            </Link>
            
            <Link
              to="/resources"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-400 ${isActive('/resources')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Box className="h-4 w-4" />
              <span>Resources</span>
            </Link>
            
            <Link
              to="/volunteers"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-400 ${isActive('/volunteers')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="h-4 w-4" />
              <span>Volunteers</span>
            </Link>
            
            {!loading && user ? (
              <Link
                to="/profile"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-400 ${isActive('/profile')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-400 ${isActive('/auth')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-16 invisible"></div>
    </nav>
  );
}

export default Navbar;