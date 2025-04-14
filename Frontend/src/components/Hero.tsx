
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, FileText } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-pipeman-light-blue-grey to-pipeman-deep-blue dark:from-pipeman-deep-blue dark:to-black relative overflow-hidden">
      {/* Decorative wave pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-64 opacity-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white dark:fill-gray-800"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className={`text-center lg:text-left mb-12 lg:mb-0 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Seamless Data Flow with <span className="text-pipeman-teal">PipeMan</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Effortlessly move data between ClickHouse and Flat Files with a few clicks. Simplify your data pipeline today.
            </p>
            <Link to="/dashboard" className="cta-button inline-flex items-center">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className={`relative transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="w-80 h-80 md:w-96 md:h-96 relative">
              {/* Animated pipeline illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="text-pipeman-teal w-20 h-20 absolute left-0" />
                <div className="h-2 w-40 bg-gradient-to-r from-pipeman-teal to-white dark:to-gray-300 rounded-full absolute left-16 animate-pulse"></div>
                <FileText className="text-white w-20 h-20 absolute right-0" />
              </div>
              <div className="absolute inset-0 bg-pipeman-deep-blue/10 dark:bg-white/5 backdrop-blur-sm rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
