
import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, MessageSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-pipeman-deep-blue dark:bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="text-white font-bold text-2xl flex items-center">
              <span className="text-pipeman-teal mr-1">Pipe</span>Man
            </Link>
            <p className="mt-4 text-white/80">
              Simplifying data transfer between ClickHouse and Flat Files.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <button onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/80 hover:text-pipeman-teal transition-colors text-left">Home</button>
              <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/80 hover:text-pipeman-teal transition-colors text-left">About</button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/80 hover:text-pipeman-teal transition-colors text-left">Features</button>
              <button onClick={() => document.getElementById('help')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/80 hover:text-pipeman-teal transition-colors text-left">Documentation</button>
              <Link to="/dashboard" className="text-white/80 hover:text-pipeman-teal transition-colors">Dashboard</Link>
            </nav>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-pipeman-teal transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-white hover:text-pipeman-teal transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-pipeman-teal transition-colors">
                <MessageSquare size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-sm text-white/60 text-center">
          © 2025 PipeMan. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
