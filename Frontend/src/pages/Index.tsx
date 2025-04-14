
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import AboutSection from '@/components/AboutSection';
import HelpSection from '@/components/HelpSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-pipeman-deep-blue dark:text-white">
      <Navbar />
      <div id="home">
        <Hero />
      </div>
      <div id="features">
        <Features />
      </div>
      <div id="about">
        <AboutSection />
      </div>
      <div id="help">
        <HelpSection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
