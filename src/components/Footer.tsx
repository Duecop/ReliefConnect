import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Mail, Github, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-primary-400" />
              <span className="font-bold text-xl text-white">ReliefConnect</span>
            </div>
            <p className="text-sm">
              Empowering communities to respond efficiently to emergencies through real-time coordination, resource tracking, and volunteer management.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link to="/incidents" className="text-gray-400 hover:text-white transition-colors">Incidents</Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</Link>
              </li>
              <li>
                <Link to="/volunteers" className="text-gray-400 hover:text-white transition-colors">Volunteers</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <p className="text-sm mb-4">Need assistance or have suggestions? Reach out to our team.</p>
            <a 
              href="mailto:contact@reliefconnect.org"
              className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              contact@reliefconnect.org
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-sm text-center text-gray-400">
          <p>© {new Date().getFullYear()} ReliefConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 