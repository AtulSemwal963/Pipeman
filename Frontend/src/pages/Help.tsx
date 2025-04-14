
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="border-b border-pipeman-blue-grey-border last:border-0">
      <button
        className="flex justify-between items-center w-full py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-pipeman-deep-blue">{question}</h3>
        <ChevronDown 
          className={`w-5 h-5 text-pipeman-grey transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {isOpen && (
        <div className="pb-4 text-pipeman-grey animate-accordion-down">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const Help = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-pipeman-deep-blue mb-4">Help & Documentation</h1>
          <p className="text-center text-pipeman-grey text-xl mb-12 max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of PipeMan.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-pipeman-light-grey rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <h2 className="text-xl font-semibold text-pipeman-deep-blue mb-3">Getting Started</h2>
              <p className="text-pipeman-grey mb-4">
                New to PipeMan? Learn the basics and set up your first data transfer.
              </p>
              <a href="#" className="text-pipeman-teal hover:text-pipeman-deep-blue transition-colors">Read guide →</a>
            </div>
            
            <div className="bg-pipeman-light-grey rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <h2 className="text-xl font-semibold text-pipeman-deep-blue mb-3">Advanced Features</h2>
              <p className="text-pipeman-grey mb-4">
                Dive deeper into advanced settings, optimizations, and multi-table joins.
              </p>
              <a href="#" className="text-pipeman-teal hover:text-pipeman-deep-blue transition-colors">Explore features →</a>
            </div>
            
            <div className="bg-pipeman-light-grey rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <h2 className="text-xl font-semibold text-pipeman-deep-blue mb-3">API Reference</h2>
              <p className="text-pipeman-grey mb-4">
                Integrate PipeMan with your own tools using our comprehensive API.
              </p>
              <a href="#" className="text-pipeman-teal hover:text-pipeman-deep-blue transition-colors">View API docs →</a>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-pipeman-deep-blue mb-6">Frequently Asked Questions</h2>
            
            <div className="bg-white rounded-lg border border-pipeman-blue-grey-border">
              <FAQItem 
                question="How do I connect to a ClickHouse database?"
                answer="To connect to a ClickHouse database, go to the Dashboard, select 'ClickHouse' as the source, and enter your host, port, database name, user, and JWT token. Then click 'Connect' to establish a connection."
              />
              
              <FAQItem 
                question="What file formats are supported for Flat Files?"
                answer="PipeMan supports CSV, TSV, and custom-delimited text files as both sources and targets. You can select your delimiter from the dropdown or specify a custom one."
              />
              
              <FAQItem 
                question="Can I select specific columns to transfer?"
                answer="Yes! After connecting and loading the schema, you'll see a list of all available columns. Simply check the ones you want to include in your data transfer."
              />
              
              <FAQItem 
                question="How secure is the JWT authentication?"
                answer="Very secure. All JWT tokens are transmitted over HTTPS and are never stored by PipeMan. We follow best practices for secure authentication and data handling."
              />
              
              <FAQItem 
                question="Is there a limit to how much data I can transfer?"
                answer="PipeMan is designed to handle large datasets efficiently. While there's no strict limit, performance may vary based on your network connection and hardware resources."
              />
              
              <FAQItem 
                question="How do I set up a multi-table join in ClickHouse?"
                answer="After selecting ClickHouse as your source, click 'Add Table' to add additional tables. You can then specify join conditions between the tables in the JOIN settings section."
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Help;
