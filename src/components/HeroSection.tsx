import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Users, Box, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20 lg:py-32">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <div className="text-center max-w-3xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Coordinating Relief When It Matters Most
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            ReliefConnect empowers communities to respond efficiently to emergencies through real-time coordination, resource tracking, and volunteer management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/incidents" 
              className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium flex items-center justify-center transition-transform hover:scale-105 hover:shadow-lg"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              Report Incident
            </Link>
            <Link 
              to="/volunteers"
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium flex items-center justify-center transition-transform hover:scale-105 hover:shadow-lg border border-primary-400"
            >
              <Users className="h-5 w-5 mr-2" />
              Volunteer
            </Link>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-primary-500 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Incident Tracking</h3>
            <p className="text-primary-100">Monitor emergencies as they unfold with live updates and interactive mapping.</p>
            <Link to="/incidents" className="mt-4 inline-flex items-center text-white hover:underline">
              View Incidents <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-primary-500 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Box className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Resource Management</h3>
            <p className="text-primary-100">Efficiently allocate and track critical supplies where they're needed most.</p>
            <Link to="/resources" className="mt-4 inline-flex items-center text-white hover:underline">
              Manage Resources <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-primary-500 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Volunteer Coordination</h3>
            <p className="text-primary-100">Connect skilled volunteers with the communities that need their help.</p>
            <Link to="/volunteers" className="mt-4 inline-flex items-center text-white hover:underline">
              Find Volunteers <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 