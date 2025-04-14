
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Database, FileText, ArrowRightLeft } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-pipeman-deep-blue mb-12">About PipeMan</h1>
          
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-pipeman-deep-blue mb-4">Our Mission</h2>
              <p className="text-pipeman-grey text-lg leading-relaxed">
                PipeMan was born from a simple idea: data movement should be easy. 
                As developers and data professionals, we were frustrated by the complexity 
                of moving data between ClickHouse and Flat Files. We built PipeMan to 
                solve this problem with an intuitive, powerful interface that simplifies 
                data transfer without sacrificing flexibility.
              </p>
            </div>
            
            <div className="flex justify-center mb-12">
              <div className="bg-pipeman-light-blue-grey rounded-xl p-6 flex items-center space-x-6 max-w-md">
                <Database className="text-pipeman-deep-blue w-14 h-14" />
                <ArrowRightLeft className="text-pipeman-teal w-10 h-10" />
                <FileText className="text-pipeman-deep-blue w-14 h-14" />
              </div>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-pipeman-deep-blue mb-4">How It Works</h2>
              <p className="text-pipeman-grey text-lg leading-relaxed mb-6">
                PipeMan creates a seamless bridge between ClickHouse databases and structured 
                Flat Files. With our intuitive dashboard, you can:
              </p>
              
              <ul className="list-disc pl-8 text-pipeman-grey text-lg leading-relaxed mb-6 space-y-2">
                <li>Connect to ClickHouse with secure JWT authentication</li>
                <li>Select specific tables and columns for transfer</li>
                <li>Configure delimiters and formatting for Flat Files</li>
                <li>Preview data before transfer</li>
                <li>Execute bidirectional transfers quickly and reliably</li>
              </ul>
              
              <p className="text-pipeman-grey text-lg leading-relaxed">
                Our efficient transfer engine optimizes the process for speed and reliability, 
                handling large datasets with ease.
              </p>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-pipeman-deep-blue mb-4">The Team</h2>
              <p className="text-pipeman-grey text-lg leading-relaxed">
                PipeMan is developed by a passionate team of data engineers and 
                UX specialists who understand the challenges of modern data workflows. 
                With decades of combined experience working with ClickHouse, SQL, and 
                various data formats, we've built a tool we're proud to use ourselves.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <a href="/dashboard" className="cta-button">
              Try PipeMan Now
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
