import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Home } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-md border-b border-gray-200/50 dark:border-blue-400/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
            <Code2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-white bg-clip-text text-transparent">
              Deepak's Sheet
            </h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link 
              to="/" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600/20 dark:bg-blue-600/20 hover:bg-blue-600/30 dark:hover:bg-blue-600/30 transition-colors duration-200 text-gray-900 dark:text-white border border-blue-400/30 hover:border-blue-400/50"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;