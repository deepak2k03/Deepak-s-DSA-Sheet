import React from 'react';
import { Instagram, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/80 dark:bg-slate-800/30 backdrop-blur-sm border-t border-gray-200 dark:border-blue-400/20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-white bg-clip-text text-transparent mb-2">
              Deepak's Sheet
            </h3>
            <p className="text-gray-600 dark:text-blue-200 text-lg">
              Master Data Structures & Algorithms
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <a
              href="https://instagram.com/deepak"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-600/20 dark:to-purple-600/20 hover:from-pink-200 hover:to-purple-200 dark:hover:from-pink-600/30 dark:hover:to-purple-600/30 rounded-full border border-pink-200 dark:border-pink-400/30 hover:border-pink-300 dark:hover:border-pink-400/50 transition-all duration-300 hover:scale-110 shadow-lg"
            >
              <Instagram className="h-5 w-5 text-pink-600 dark:text-pink-300 group-hover:text-pink-700 dark:group-hover:text-pink-200 transition-colors" />
            </a>
            
            <a
              href="https://linkedin.com/in/deepak"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-600/20 dark:to-cyan-600/20 hover:from-blue-200 hover:to-cyan-200 dark:hover:from-blue-600/30 dark:hover:to-cyan-600/30 rounded-full border border-blue-200 dark:border-blue-400/30 hover:border-blue-300 dark:hover:border-blue-400/50 transition-all duration-300 hover:scale-110 shadow-lg"
            >
              <Linkedin className="h-5 w-5 text-blue-600 dark:text-blue-300 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors" />
            </a>
            
            <a
              href="https://twitter.com/deepak"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-600/20 dark:to-blue-600/20 hover:from-sky-200 hover:to-blue-200 dark:hover:from-sky-600/30 dark:hover:to-blue-600/30 rounded-full border border-sky-200 dark:border-sky-400/30 hover:border-sky-300 dark:hover:border-sky-400/50 transition-all duration-300 hover:scale-110 shadow-lg"
            >
              <Twitter className="h-5 w-5 text-sky-600 dark:text-sky-300 group-hover:text-sky-700 dark:group-hover:text-sky-200 transition-colors" />
            </a>
            
            <a
              href="mailto:deepak@example.com"
              className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-600/20 dark:to-green-600/20 hover:from-emerald-200 hover:to-green-200 dark:hover:from-emerald-600/30 dark:hover:to-green-600/30 rounded-full border border-emerald-200 dark:border-emerald-400/30 hover:border-emerald-300 dark:hover:border-emerald-400/50 transition-all duration-300 hover:scale-110 shadow-lg"
            >
              <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-200 transition-colors" />
            </a>
          </div>

          {/* Contact Info */}
          <div className="mb-8">
            <p className="text-gray-600 dark:text-blue-200 mb-2">Get in touch</p>
            <a 
              href="mailto:deepak@example.com"
              className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-medium"
            >
              deepak@example.com
            </a>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-200 dark:border-blue-400/20">
            <p className="text-gray-600 dark:text-blue-300 text-sm">
              © 2024 Deepak's Sheet. Made with ❤️ for the coding community.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;